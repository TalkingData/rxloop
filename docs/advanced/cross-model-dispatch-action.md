# 跨 model 传递消息

Model A：
```javascript
name: 'a',
pipes: {
  getData(action$) {
    // ...
  },
},
```

Model B：
```javascript
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

在 pipes 中调用 `dispatch`，指定 action 的 type 为 `model/pipe`。
```javascript
dispatch({
  type: 'a/getData',
  data,
});
```
