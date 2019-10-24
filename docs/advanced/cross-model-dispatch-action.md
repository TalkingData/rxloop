# 跨 model 通信

rxloop 支持两种跨 model 通信方式，在 pipe 中主动发送消息和在 Subscriptions 订阅其它 model 的消息。

一、在 subscriptions 中订阅消息

在 subscriptions 中用 model 函数设置 model 之间的订阅关系，然后通过函数的第一个参数获取任意 model 发送的 pipe 或者 reducer 数据源，对于 pipe 类型数据源，可设置不同的key 监听异步执行前后的消息。

```js
const filter = {
  name: 'filter',
  state: {
    city: 0,
  },
  reducers: {
    selectCity(state, action) {
      return {
        city: action.city,
      };
    },
  },
  pipes: {
    getData(action$) {
      return action$.pipe(
        // ...
      );
    },
  },
};

const chart = {
  name: 'chart',
  // ...
  subscriptions: {
    model(source, { dispatch }) {
      source('filter/selectCity').subscribe((action) => {
        dispatch({
          type: 'chart/setList',
          list: [1,2,3],
        });
      });
      // pipe 执行前的消息
      source('filter/getData').subscribe((action) => {
        dispatch({
          type: 'chart/setList',
          list: [1,2,3],
        });
      });
      // pipe 执行完成后的消息
      source('filter/getData/end').subscribe((action) => {
        dispatch({
          type: 'chart/setList',
          list: [1,2,3],
        });
      });
    },
  },
};

const table = {
  name: 'table',
  // ...
  subscriptions: {
    model(source, { dispatch }) {
      source('filter/selectCity').subscribe((action) => {
        dispatch({
          type: 'table/setList',
          list: [4,5,6],
        });
      });
    },
  },
};
```

二、在 pipe 中向其它 model 发送消息

调用 `dispatch` 方法，并指定 action 的 type 为 `model/pipe`。

```js
dispatch({
  type: 'a/getData',
  data,
});
```

Model A：
```js
name: 'a',
pipes: {
  getData(action$) {
    // ...
  },
},
```

Model B：
```js
name: 'b',
pipes: {
  getData(action$, { dispatch, map }) {
    action$.pipe(
      map((data) => {
        dispatch({
          type: 'a/getData',
          data,
        });
        return {
          type: 'reducer-name',
          data,
        };
      }),
    );    
  },
},
```

