# 错误处理

在 epics 中，我们通过 RxJS 的 mergeMap 或 switchMap 处理异步请求，用 `from` 方法，将 Promise 转换为可订阅对象 Observable

完整的代码：

```javascript
import { from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import rxLoop from '@rxloop/core';

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
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          return from(
            api(),
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

app.stream('counter').subscribe(
  (state) => {
    console.log(state);
  },
  (err) => {
    console.log(err);
  },
);

app.dispatch({
  type: 'counter/getData',
});
```