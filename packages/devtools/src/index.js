import { combineLatest } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

export default function rxloopDevtools(config = {}) {
  return function init({
    onStatePatch$: action$,
    onStart$,
  }) {
    if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
      console.warn(
        'You need to install Redux DevTools Extension，when using rxloop devtool plugin.\r\n' +
        'To see more infomation about DevTools: https://github.com/zalmoxisus/redux-devtools-extension/'
      );
      return;
    }
    onStart$.subscribe(() => {
      const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
  
      const streams = [];
      const models = [];
      Object.keys(this._stream).forEach(name => {
        // ignore items in blacklist
        if (config.blacklist && config.blacklist.includes(name)) {
          return;
        }
        models.push(name);
        streams.push(this[`${name}$`]);
      });

      const store$ = combineLatest( ...streams ).pipe(
        map((arr) => {
          const store = {};
          models.forEach(( model, index) => {
            store[model] = arr[index];
          });
          return store;
        }),
      );

      store$.subscribe((store) => devTools.init(store)).unsubscribe();
      
      const output$ = store$.pipe(
        withLatestFrom(action$),
        map(
          ([store, { reducerAction: action }]) => devTools.send(action, store)
        ),
      );
      output$.subscribe();
    });
  };
};
