import { Subject, BehaviorSubject, throwError, combineLatest, merge } from "rxjs";
import { filter, scan, map, publishReplay, refCount, catchError } from "rxjs/operators";
import invariant from 'invariant';
import checkModel from './check-model';
import { isPlainObject, isFunction, noop } from './utils';
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

  function createEpicStreams(name, reducers, epics, out$$) {
    const stream = this._stream[name];
    const errors = this._errors[name];

    Object.keys(epics).forEach(type => {
      // epics 中函数名称不能跟 reducers 里的函数同名
      invariant(
        !stream[`reducer_${type}$`],
        `[epics] duplicated type ${type} in epics and reducers`,
      );

      // 为每一个 epic 创建一个数据流,
      stream[`epic_${type}$`] = createStream(`${name}/${type}`);
      stream[`epic_${type}_cancel$`] = createStream(`${name}/${type}/cancel`);
      stream[`epic_${type}_error$`] = createStream(`${name}/${type}/error`);
      
      errors.push(stream[`epic_${type}_error$`]);

      stream[`epic_${type}$`].subscribe(data => {
        data.__cancel__ = stream[`epic_${type}_cancel$`];
        data.__bus__ = bus$;

        this.dispatch({
          data,
          type: 'plugin',
          action: 'onEpicStart',
          model: name,
          epic: type,
        });
      });

      stream[`epic_${type}_cancel$`].subscribe(() => {
        this.dispatch({
          type: 'plugin',
          action: 'onEpicCancel',
          model: name,
          epic: type,
        });
      });

      stream[`epic_${type}_error$`].subscribe(({ model, epic, error }) => {
        option.onError({ model, epic, error });
        this.dispatch({
          model,
          epic,
          error,
          type: 'plugin',
          action: 'onEpicError',
        });
      });
      
      // 将数据流导入到 epic 之中，进行异步操作
      epics[type].call(this,
        stream[`epic_${type}$`],
        { call, map, dispatch, put: dispatch, cancel$: stream[`epic_${type}_cancel$`] }
      ).pipe(
        map(action => {
          const { type: reducer } = action;
          invariant(
            type,
            '[epics] action should be a plain object with type',
          );
          invariant(
            reducers[reducer],
            `[epics] undefined reducer ${reducer}`,
          );
          this.dispatch({
            data: action,
            type: 'plugin',
            action: 'onEpicEnd',
            model: name,
            epic: type,
          });
          const rtn = this.createReducer(action, reducers[reducer]);
          action.type = `${name}/${action.type}`;
          action.__source__ = { epic: type };
          rtn.__action__ = action;
          return rtn;
        }),
        catchError((error) => {
          option.onError({
            error,
            model: name,
            epic: type,
          });
          this.dispatch({
            error,
            type: 'plugin',
            action: 'onEpicError',
            model: name,
            epic: type,
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

  function model({ name, state = {}, reducers = {}, epics = {} }) {
    checkModel({ name, state, reducers, epics }, this._state);
    
    this.dispatch({
      type: 'plugin',
      action: 'onModelBeforeCreate',
      model: { name, state, reducers, epics },
    });

    this._state[name] = state;
    this._reducers[name] = reducers;
    this._epics[name] = epics;
    this._stream[name] = {};
    this._errors[name] = [];

    const out$$ = new BehaviorSubject(state => state);

    // 为 reducers 创建同步数据流
    createReducerStreams.call(this, name, reducers, out$$);

    // 为 epics 创建异步数据流
    createEpicStreams.call(this, name, reducers, epics, out$$);

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
    _epics: {},
    getSingleStore,
    model,
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
