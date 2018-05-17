# 错误处理

在 epics 中，我们通过 RxJS 的 mergeMap 或 switchMap 处理异步请求，用 `Observable.fromPromise` 方法，将 Promise 转换为可订阅对象 Observable，在转换的过程中建议显示的处理 Promise 的异常:

```javascript
api().catch(
  (v) => {
    return {};
  }
),
```

完整的代码：

```javascript
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import rxLoop from 'rxloop';

// 模拟 http 异常
const api = async () => {
  throw new Error('Http Error');
  // return { code: 200, data: 1 };
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

app.dispatch({
  type: 'counter/getData',
});
```