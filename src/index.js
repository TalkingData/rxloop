import { Subject, BehaviorSubject } from "rxjs";
import { filter, scan, map, publishReplay, refCount } from "rxjs/operators";
import invariant from 'invariant';
import checkModel from './check-model';

const bus$ = new Subject();

export default function rxLoop() {
  function createStream(type) {
    return bus$.pipe(filter(e => e.type.indexOf(type) > -1));
  }

  function model({ name, state = {}, reducers = {}, epics = {} }) {
    checkModel({ name, state, reducers, epics }, this._state);
    this._state[name] = state;
    this._reducers[name] = reducers;
    const out$$ = new BehaviorSubject(state => state);

    // 数据流出口
    this[`${name}$`] = out$$.pipe(
      scan((nextState, reducer) => reducer(nextState), state),
      publishReplay(1),
      refCount()
    );

    this._stream[name] = {};

    // 为 reducers 创建同步数据流
    Object.keys(reducers).forEach(type => {
      this._stream[name][`reducer_${type}$`] = createStream(`${name}/${type}`);
      // 叠加
      this._stream[name][`reducer_${type}$`]
        .pipe(
          map(action => {
            return state => reducers[type](state, action);
          })
        )
        .subscribe(out$$);
    });

    // 为 epics 创建异步数据流
    Object.keys(epics).forEach(type => {
      this._stream[name][`epic_${type}$`] = createStream(`${name}/${type}`);
      // 叠加
      epics[type](this._stream[name][`epic_${type}$`])
        .pipe(
          map(action => {
            const { type } = action;
            invariant(
              type,
              '[action] action should be a plain Object with type',
            );
            invariant(
              reducers[type],
              `不存在的 reducer ${type}`,
            );
            return state => reducers[type](state, action);
          }),
        )
        .subscribe(out$$);
    });
  }

  function dispatch(action) {
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

  function stream(modelName) {
    return this[`${modelName}$`];
  }

  const app = {
    _state: {},
    _stream: {},
    _reducers: {},
    model,
    dispatch,
    getState,
    stream,
  };
  return app;
}
