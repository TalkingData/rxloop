import { Subject, BehaviorSubject } from 'rxjs';
import { filter, scan, map, publishReplay, refCount } from 'rxjs/operators';

const bus$ = new Subject();

export default function init() {

  function stream(type) {
    return bus$.pipe(
      filter((e) => e.type.indexOf(type) > -1),
    );
  }

  function model({ name, state, reducers, epics }) {
    const out$$ = new BehaviorSubject(state => state);
    this._state[name] = state;
    this._reducers[name] = reducers;

    // 为 reducers 创建同步数据流
    this._stream[name] = {};
    Object.keys(reducers).forEach((type) => {
      this._stream[name][`${type}$`] = stream(`${name}/${type}`);
    });
    
    // 出口
    this[`${name}$`] = out$$.pipe(
      scan((nextState, reducer) => reducer(nextState), state),
      publishReplay(1),
      refCount(),
    );

    // 叠加
    Object.keys(reducers).forEach((type) => {
      this._stream[name][`${type}$`].pipe(
        map(action => {
          return state => reducers[type](state, action);
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
