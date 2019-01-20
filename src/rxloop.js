import { Subject, BehaviorSubject, throwError, combineLatest, merge } from "rxjs";
import { filter, scan, map, publishReplay, refCount, catchError } from "rxjs/operators";
import invariant from 'invariant';
import checkModel from './check-model';
import { isPlainObject, isFunction, noop, normalizeArgsModle } from './utils';
import initPlugins from './plugins';
import { call } from './call';

export function rxloop( config = {} ) {
  const option = { 
    plugins: [],
    onError() {},
    ...config,
  };

  const bus$ = new Subject();

  function createStream(type) {
    return bus$.pipe(
      filter(e => e.type === type),
    );
  }

  function createReducerStreams(name, reducers, out$$) {
    const stream = this._stream[name];

    Object.keys(reducers).forEach(type => {
      // 为每一个 reducer 创建一个数据流,
      stream[`reducer_${type}$`] = createStream(`${name}/${type}`);
      
      // 将数据流导入到 reducer 之中，进行同步状态数据计算
      stream[`reducer_${type}$`].pipe(
        map(action => {
          const rtn = this.createReducer(action, reducers[type]);
          action.__source__ = { reducer: type };
          rtn.__action__ = action;
          return rtn;
        }),
      )
        // 将同步计算结果推送出去
      .subscribe(out$$);
    });
  }

  function createPipeStreams(name, reducers, pipes, out$$) {
    const stream = this._stream[name];
    const errors = this._errors[name];

    Object.keys(pipes).forEach(type => {
      // pipes 中函数名称不能跟 reducers 里的函数同名
      invariant(
        !stream[`reducer_${type}$`],
        `[pipes] duplicated type ${type} in pipes and reducers`,
      );

      // 为每一个 pipe 创建一个数据流,
      stream[`pipe_${type}$`] = createStream(`${name}/${type}`);
      stream[`pipe_${type}_cancel$`] = createStream(`${name}/${type}/cancel`);
      stream[`pipe_${type}_error$`] = createStream(`${name}/${type}/error`);
      
      errors.push(stream[`pipe_${type}_error$`]);

      stream[`pipe_${type}$`].subscribe(data => {
        data.__cancel__ = stream[`pipe_${type}_cancel$`];
        data.__bus__ = bus$;

        this.dispatch({
          data,
          type: 'plugin',
          action: 'onPipeStart',
          model: name,
          pipe: type,
        });
      });

      stream[`pipe_${type}_cancel$`].subscribe(() => {
        this.dispatch({
          type: 'plugin',
          action: 'onPipeCancel',
          model: name,
          pipe: type,
        });
      });

      stream[`pipe_${type}_error$`].subscribe(({ model, pipe, error }) => {
        option.onError({ model, pipe, error });
        this.dispatch({
          model,
          pipe,
          error,
          type: 'plugin',
          action: 'onPipeError',
        });
      });
      
      // 将数据流导入到 pipe 之中，进行异步操作
      pipes[type].call(this,
        stream[`pipe_${type}$`],
        { call, map, dispatch, put: dispatch, cancel$: stream[`pipe_${type}_cancel$`] }
      ).pipe(
        map(action => {
          const { type: reducer } = action;
          invariant(
            type,
            '[pipes] action should be a plain object with type',
          );
          invariant(
            reducers[reducer],
            `[pipes] undefined reducer ${reducer}`,
          );
          this.dispatch({
            data: action,
            type: 'plugin',
            action: 'onPipeEnd',
            model: name,
            pipe: type,
          });
          const rtn = this.createReducer(action, reducers[reducer]);
          action.type = `${name}/${action.type}`;
          action.__source__ = { pipe: type };
          rtn.__action__ = action;
          return rtn;
        }),
        catchError((error) => {
          option.onError({
            error,
            model: name,
            pipe: type,
          });
          this.dispatch({
            error,
            type: 'plugin',
            action: 'onPipeError',
            model: name,
            pipe: type,
          });
          return throwError(error);
        }),
      )
      // 将异步计算结果推送出去
      .subscribe(out$$);
    });
  }

  function createModelStream(name, state, out$$) {
    const output$ = out$$.pipe(
      scan((prevState, reducer) => {
        const nextState = reducer(prevState);
        if (reducer.__action__) {
          this.dispatch({
            state: nextState,
            reducerAction: reducer.__action__,
            model: name,
            type: 'plugin',
            action: 'onStatePatch',
          });
          delete reducer.__action__;
        }
        return nextState;
      }, state),
      publishReplay(1),
      refCount(),
    );

    this[`${name}$`] = merge(
      output$,
      merge(...this._errors[name]),
    );
  }

  function model({ name, state = {}, reducers = {}, pipes = {} }) {
    checkModel({ name, state, reducers, pipes }, this._state);
    
    this.dispatch({
      type: 'plugin',
      action: 'onModelBeforeCreate',
      model: { name, state, reducers, pipes },
    });

    this._state[name] = state;
    this._reducers[name] = reducers;
    this._pipes[name] = pipes;
    this._stream[name] = {};
    this._errors[name] = [];

    const out$$ = new BehaviorSubject(state => state);

    // 为 reducers 创建同步数据流
    createReducerStreams.call(this, name, reducers, out$$);

    // 为 pipes 创建异步数据流
    createPipeStreams.call(this, name, reducers, pipes, out$$);

    // 创建数据流出口
    createModelStream.call(this, name, state, out$$);

    this.dispatch({
      type: 'plugin',
      action: 'onModelCreated',
      model: name,
    });
  }

  function dispatch(action) {
    invariant(
      isPlainObject(action),
      '[action] Actions must be plain objects.',
    );
    invariant(
      action.type,
      '[action] action should be a plain Object with type',
    );
    bus$.next(action);
  }

  function getState(name) {
    let stream$ = this.stream(name);
    let _state;
    stream$.subscribe(state => (_state = state));
    return _state;
  }

  function subscribe(listener) {
    invariant(
      isFunction(listener),
      'Expected the listener to be a function',
    );
    const sub = this.stream().subscribe(listener);

    let isSubscribed = true
    return function unsubscribe() {
      if (!isSubscribed) return;
      isSubscribed = false;
      sub.unsubscribe();
    };
  }

  function stream(name) {
    let stream$ = !!name ? this[`${name}$`] : this.getSingleStore();
    !!name && invariant(
      stream$,
      `[app.stream] model "${name}" must be registered`,
    );
    return stream$;
  }

  function getSingleStore() {
    const streams = [];
    const models = [];
    
    Object.keys(this._stream).forEach(name => {
      models.push(name);
      streams.push(this[`${name}$`]);
    });
  
    return combineLatest( ...streams ).pipe(
      map((arr) => {
        const store = {};
        models.forEach(( model, index) => {
          store[model] = arr[index];
        });
        return store;
      }),
    );
  }

  function createReducer(action = {}, reducer = noop) {
    return (state) => reducer(state, action);
  }

  function start() {
    this.dispatch({
      type: 'plugin',
      action: 'onStart',
    });
  }

  const app = {
    _state: {},
    _stream: {},
    _errors: {},
    _reducers: {},
    _pipes: {},
    getSingleStore,
    model: normalizeArgsModle(model),
    subscribe,
    getState,
    stream,
    createReducer,
    dispatch,
    start,
    next: dispatch,
  };

  initPlugins.call(app, option.plugins, createStream('plugin'));

  return app;
}
