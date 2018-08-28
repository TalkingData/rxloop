import { Subject, BehaviorSubject, throwError } from "rxjs";
import { filter, scan, map, publishReplay, refCount, catchError } from "rxjs/operators";
import invariant from 'invariant';
import checkModel from './check-model';
import initPlugins from './plugins';

export function rxLoop(option = { plugins: [] }) {
  const bus$ = new Subject();

  function createStream(type) {
    return bus$.pipe(
      filter(e => e.type === type),
    );
  }

  function model({ name, state = {}, reducers = {}, epics = {} }) {
    checkModel({ name, state, reducers, epics }, this._state);
    this._state[name] = state;
    this._reducers[name] = reducers;
    this._epics[name] = epics;

    const out$$ = new BehaviorSubject(state => state);

    // 创建数据流出口
    this[`${name}$`] = out$$.pipe(
      scan((nextState, reducer) => reducer(nextState), state),
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
            return state => reducers[type](state, action);
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
          data,
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
            return state => reducers[reducer](state, action);
          }),
          catchError((error) => {
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
      action: 'onModel',
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
    invariant(
      name,
      `[app.getState] name should be passed`,
    );
    let _state;
    this[`${name}$`].subscribe(state => {
      _state = state;
    });
    return _state;
  }

  function stream(name) {
    invariant(
      name,
      `[app.stream] name should be passed`,
    );
    const stream$ = this[`${name}$`];
    invariant(
      stream$,
      `[app.stream] model "${name}" must be registered`,
    );
    return stream$;
  }

  const app = {
    _state: {},
    _stream: {},
    _reducers: {},
    _epics: {},
    model,
    getState,
    stream,
    dispatch,
    next: dispatch,
  };

  initPlugins.call(app, option.plugins, createStream('plugin'));

  return app;
}
