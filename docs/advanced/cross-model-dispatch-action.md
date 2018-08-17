# 跨 model 传递消息

Model A：
```javascript
name: 'a',
epics: {
  getData(action$) {
    // ...
  },
},
```

Model B：
```javascript
name: 'b',
epics: {
  getData(action$) {
    action$.pipe(
      map((data) => {
        this.dispatch({
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

在 epics 中调用 `dispatch`，指定 action 的 type 为 `model/epic`。
```javascript
this.dispatch({
  type: 'a/getData',
  data,
});
```