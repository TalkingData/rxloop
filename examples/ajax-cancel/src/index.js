import { Observable, of } from 'rxjs';
import { mergeMap, switchMap, map, takeUntil } from 'rxjs/operators';
import rxLoop from '../../../src/';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 5000);
  });
  return { code: 200, data };
};

const counterModel = {
  name: 'counter',
  state: {
    error: '',
    counter: 0,
  },
  reducers: {
    increment(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    decrement(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    handleError(state, action) {
      return {
        ...state,
        error: action.error,
      };
    },
  },
  epics: {
    getData(action$, cancel$) {
      return action$.pipe(
        mergeMap(() => {
          return Observable.fromPromise(
            apiSlow().catch((error) => {
              return { error };
            }),
          )
          .pipe(
            takeUntil(cancel$),
          );
        }),
        map((data) => {
          if (data.error) {
            return {
              error: data.error,
              type: 'handleError',
            };
          }
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

// 取消异步请求
app.dispatch({
  type: 'counter/getData/cancel',
});
