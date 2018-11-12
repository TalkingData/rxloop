# 取消请求

在复杂单页应用下，会经常频繁地切换路由，需要及时取消上一个界面未完成的请求。
在 RxJS 中，一般用 `takeUntil` 操作符来终止数据流，我们在 epics 中加入 `takeUntil` 来取消这个请求。接下来我们通过一个简单的实例，演示下在 rxloop 中如何取消一个 epic。

## 模拟慢请求
首先使用 Promise 来模拟一个慢请求，这个接口会在 5 秒后返回数据。
```javascript
const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 5000);
  });
  return { code: 200, data };
};
```

## 取消异步请求
在 epics 中，串联一个 `takeUntil` 操作符，这个操作符会“监听“取消信号 cancel$.

```javascript
  import rxloop, { call } from 'rxloop';
  // ...
    getData(action$, cancel$) {
      return action$.pipe(
        call(async () => {
          return await apiSlow();
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  // ...
```

dispatch 方法，不仅能发起异步请求，还能出取消信号。
```javascript
const actionGetData = {
  type: 'counter/getData',
};

const actionGetDataCancel = {
  type: 'counter/getData/cancel',
};
app.dispatch(actionGetDataCancel);
```

以 React 为例，组件在销毁之前，取消异步请求：
```javascript
// ...
componentWillUnmount() {
  app.dispatch({
    type: 'counter/getData/cancel',
  });
}
// ...
```
