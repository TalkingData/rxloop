import { Subject, BehaviorSubject } from "rxjs";
import { filter, scan, map, publishReplay, refCount } from "rxjs/operators";
import invariant from 'invariant';
import checkModel from './check-model';

const bus$ = new Subject();

export default function rxLoop() {
  function createStream(type) {
    return bus$.pipe(
      filter(e => e.type === type),
    );
  }

  function model({ name, state = {}, reducers = {}, epics = {} }) {
    checkModel({ name, state, reducers, epics }, this._state);
    this._state[name] = state;
    this._reducers[name] = reducers;
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
      
      // 将数据流导入到 epic 之中，进行异步操作
      epics[type](this._stream[name][`epic_${type}$`], this._stream[name][`epic_${type}_cancel$`])
        .pipe(
          map(action => {
            const { type } = action;
            invariant(
              type,
              '[epics] action should be a plain object with type',
            );
            invariant(
              reducers[type],
              `[epics] undefined reducer ${type}`,
            );
            return state => reducers[type](state, action);
          }),
        )
        // 将异步计算结果推送出去
        .subscribe(out$$);
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
      `[app.stream] model must be registered`,
    );
    return stream$;
  }

  const next = dispatch;

  return {
    _state: {},
    _stream: {},
    _reducers: {},
    model,
    dispatch,
    next,
    getState,
    stream,
  };
}
