import { from, of } from 'rxjs';
import { mergeMap, switchMap, map } from 'rxjs/operators';
import rxLoop from '../../../src/';

const api = async () => {
  throw new Error('Http Error');
  // return { code: 200, data: 1 };
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
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          return from(
            api().catch((error) => {
              return { error };
            }),
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
