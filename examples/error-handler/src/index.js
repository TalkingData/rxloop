import { Observable, of } from 'rxjs';
import { mergeMap, switchMap, map } from 'rxjs/operators';
import rxLoop from '../../../src/';

const api = async () => {
  // throw new Error('Http Error');
  return { a: 1 };
};

const counterModel = {
  name: 'counter',
  state: 0,
  reducers: {
    increment(state) {
      return state + 1;
    },
    decrement(state) {
      return state - 1;
    }
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          return Observable.fromPromise(
            api().catch((v) => {
              console.log(v);
              return {};
            }),
          );
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  }
};

const app = rxLoop();
app.model(counterModel);

app.stream('counter').subscribe((state) => {
  console.log(state);
});


// switchMap 连续调用取消请一次异步请求
// https://ithelp.ithome.com.tw/articles/10188387
app.dispatch({
  type: 'counter/getData',
});

app.dispatch({
  type: 'counter/getData',
});
app.dispatch({
  type: 'counter/getData',
});
