import { combineLatest } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';

function devToolsPlugin({
  onCreateReducer$: action$,
}) {
  // todo
  setTimeout(() => {
    this.dispatch({
      type: 'plugin',
      action: 'onReady',
    });
  }, 0);

  const source = evt => this.plugin$.pipe( filter(e => e.action === evt) );
  
  source('onReady').subscribe(() => {
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();

    const streams = [];
    const models = [];
    Object.keys(this._stream).forEach(name => {
      models.push(name);
      streams.push(this[`${name}$`]);
    });

    const store$ = combineLatest(
      ...streams
    );

    const sub = store$.subscribe((arr) => {
      const store = {};
      models.forEach(( model, index) => {
        store[model] = arr[index];
      });
      devTools.init(store);
    });
    sub.unsubscribe();
    
    const output$ = store$.pipe(
      withLatestFrom(action$),
      map(([ arr, { actionData: action }]) => {
        const store = {};
        models.forEach(( model, index) => {
          delete arr[index].__action__;
          store[model] = arr[index];
        });
        devTools.send(action, store);
        return store;
      }),
    );

    output$.subscribe();
  });
}

export default devToolsPlugin;