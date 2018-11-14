# API

## rxLoop
创建一个应用

```javascript
import rxLoop from '@rxloop/core';
const app = rxLoop();
```

## app.model(model)
新建一个名字为 counter，初始状态为 0，有两个 reducer 的 model。

```javascript
app.model({
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
  pipes: {
    getData(action$, cancel$) {
      return action$.pipe(
        mapTo({
          type: 'increment',
        }),
      );
    }
  }
});
```
### reducer
这里 reducer 跟 Redux 中的是完全一致的，纯函数，用于叠加修改当前的 state，签名为:

```javascript
(state, action) => state;
```

### pipe
pipe 的概念来源于知名 Redux 中间件 redux-observable，在 pipe 中组合、发起和取消异步请求，签名为：

```javascript
(action$, cancel$) => action$;
```

## app.getState(modelName)
```javascript
app.getState('counter');
```

## subscribe
订阅数据源
```javascript
app.stream('counter').subscribe((state) => {});
```
或者
```javascript
app.counter$.subscribe((state) => {});
```

## app.dispatch(action)

### 同步更新
可以 dispatch 一个 action 到 reducers 中，同步地修改状态值。

```javascript
app.dispatch({
  type: 'counter/increment',
});
```

### 异步更新
还可以 dispatch 一个 action 到 pipes 中，异步地修改状态值。

```javascript
app.dispatch({
  type: 'counter/getData',
});
```

### 取消异步更新
另外，还可以取消未完成的异步请求：

```javascript
app.dispatch({
  type: 'counter/getData/cancel',
});
```

