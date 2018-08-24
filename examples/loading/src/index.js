import { from } from 'rxjs';
import { mergeMap, map, takeUntil } from 'rxjs/operators';
import rxLoop, { loading } from '../../../src/';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 2000);
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
    setData(action$){
      return action$.pipe(
        map(() => {
          return {
            type: 'increment',
          };
        }),
      );
    },
    getData(action$, cancel$) {
      return action$.pipe(
        mergeMap(() => {
          return from(
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

const app = rxLoop({
  plugins: [ loading() ],
});
app.model(counterModel);

// 全局
app.stream('loading').subscribe(state => {
  // 某个 epic 的 loading 状态
  console.log(state.epics);

  // 某个 model 的 loading 状态，支持获取异步个数
  // state.counter

  // 整个应用的 loading 状态，支持获取异步个数
  // state.global
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
// app.dispatch({
//   type: 'counter/getData/cancel',
// });
