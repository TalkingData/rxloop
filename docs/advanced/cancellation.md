# 取消请求

在复杂单页应用下，会经常频繁地切换路由，需要及时取消上一个界面未完成的请求。
在 RxJS 中，一般用 `takeUntil` 操作符来终止数据流，rxloop 将这一过程封装为 `call` 操作符，在 call 中调用的所有异步过程，可以轻松取消。

接下来我们通过一个简单的实例，演示下在 rxloop 中如何取消一个 pipe。

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
在 pipes 中，串联一个 `takeUntil` 操作符，这个操作符会“监听“取消信号 cancel$.

```javascript
  import rxloop from 'rxloop';
  // ...
    getData(action$, { call, map }) {
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
