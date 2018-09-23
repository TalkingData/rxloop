import { Subject, BehaviorSubject, throwError, combineLatest } from "rxjs";
import { filter, scan, map, publishReplay, refCount, catchError } from "rxjs/operators";
import invariant from 'invariant';
import checkModel from './check-model';
import initPlugins from './plugins';

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

    const out$$ = new BehaviorSubject(state => state);

    // 创建数据流出口
    this[`${name}$`] = out$$.pipe(
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

    this._stream[name] = {};

    // 为 reducers 创建同步数据流
    Object.keys(reducers).forEach(type => {
      // 为每一个 reducer 创建一个数据流,
      this._stream[name][`reducer_${type}$`] = createStream(`${name}/${type}`);
      
      // 将数据流导入到 reducer 之中，进行同步状态数据计算
      this._stream[name][`reducer_${type}$`]
        .pipe(
          map(action => {
            const rtn = this.createReducer(action, reducers[type]);
            rtn.__action__ = action;
            return rtn;
          }),
        )
        // 将同步计算结果推送出去
        .subscribe(out$$);
    });

    // 为 epics 创建异步数据流
    Object.keys(epics).forEach(type => {
      // epics 中函数名称不能跟 reducers 里的函数同名
      invariant(
        !this._stream[name][`reducer_${type}$`],
        `[epics] duplicated type ${type} in epics and reducers`,
      );

      // 为每一个 epic 创建一个数据流,
      this._stream[name][`epic_${type}$`] = createStream(`${name}/${type}`);
      this._stream[name][`epic_${type}_cancel$`] = createStream(`${name}/${type}/cancel`);

      this._stream[name][`epic_${type}$`].subscribe(data => {
        this.dispatch({
          data,
          type: 'plugin',
          action: 'onEpicStart',
          model: name,
          epic: type,
        });
      });

      this._stream[name][`epic_${type}_cancel$`].subscribe(data => {
        this.dispatch({
          type: 'plugin',
          action: 'onEpicCancel',
          model: name,
          epic: type,
        });
      });
      
      // 将数据流导入到 epic 之中，进行异步操作
      epics[type].call(this, this._stream[name][`epic_${type}$`], this._stream[name][`epic_${type}_cancel$`])
        .pipe(
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

    this.dispatch({
      type: 'plugin',
      action: 'onModelCreated',
      model: name,
    });
  }

  function dispatch(action) {
    const { type } = action;
    invariant(
      type,
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

  function createReducer(action = {}, reducer = () => {}) {
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
    _reducers: {},
    _epics: {},
    getSingleStore,
    model,
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
