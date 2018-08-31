import { from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import rxloop from '@rxloop/core';

const apiCrashed = async () => {
  throw new Error('Http Error');
};

const counter = {
  name: 'counter',
  state: {
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
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          return from( apiCrashed() );
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  },
};

const app = rxloop({
  onError(err) {
    console.log('Global error handler...');
    console.log(err);
  },
});
app.model(counter);
app.model({
  name: 'test',
  state: {
    code: 100,
  },
  reducers: {
    change(state, action) {
      return {
        ...state,
        code: action.code,
      }
    }
  },
});

app.stream('counter').subscribe(
  (state) => {
    console.log(state);
  },
  (err) => {
    console.log('Model error handler...');
    console.log(err);
  },
);

app.stream('test').subscribe(
  (state) => {
    console.log(state);
  },
  (err) => {
    console.log('model error handler');
    console.log(err);
  },
);


// switchMap 连续调用取消请一次异步请求
// https://ithelp.ithome.com.tw/articles/10188387
app.dispatch({
  type: 'counter/getData',
});
// // 执行 👆 代码时报错了，会中断 👇 两次调用
app.dispatch({
  type: 'counter/getData',
});

app.dispatch({
  type: 'counter/getData',
});

// 其中一个 model 报错，不会影响其它 model 的状况
app.dispatch({
  type: 'test/change',
  code: 1001,
});
