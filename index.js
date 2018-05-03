import { Subject, BehaviorSubject } from 'rxjs';
import { filter, scan, map, publishReplay, refCount } from 'rxjs/operators';

const bus$ = new Subject();

export default function init() {

  function stream(type) {
    return bus$.pipe(
      filter((e) => e.type.indexOf(type) > -1),
    );
  }

  function model({ name, state = {}, reducers = {}, epics = {} }) {
    if (this._state[name]) {
      throw Error('name 需要唯一');
    }
    this._state[name] = state;
    this._reducers[name] = reducers;
    const out$$ = new BehaviorSubject(state => state);

    // 数据流出口
    this[`${name}$`] = out$$.pipe(
      scan((nextState, reducer) => reducer(nextState), state),
      publishReplay(1),
      refCount(),
    );

    this._stream[name] = {};

    // 为 reducers 创建同步数据流
    Object.keys(reducers).forEach((type) => {
      this._stream[name][`reducer_${type}$`] = stream(`${name}/${type}`);
      // 叠加
      this._stream[name][`reducer_${type}$`].pipe(
        map(action => {
          return state => reducers[type](state, action);
        }),
      )
      .subscribe(out$$);
    });

    // 为 epics 创建异步数据流
    Object.keys(epics).forEach((type) => {
      this._stream[name][`epic_${type}$`] = stream(`${name}/${type}`);
      // 叠加
      epics[type](this._stream[name][`epic_${type}$`]).pipe(
        map(action => {
          // 验证 action 规范
          if (!action.type) {
            throw Error('epics 需要返回标准的 Action');
          }
          if (!reducers[action.type]) {
            throw Error(`不存在的 reducer ${action.type}`);
          }
          return state => reducers[action.type](state, action);
        }),
      )
      .subscribe(out$$);
    });
  }

  function dispatch(action) {
    // const [ action, name, type ] = action.type.match(/(\w+)\/(\w+)/);
    bus$.next(action);
  }

  const app = {
    //{ name: {} }
    _state: {},
    _stream: {},
    _reducers: {},
    model,
    dispatch,
  };
  return app;
};
