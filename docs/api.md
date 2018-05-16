# API

## rxLoop
创建应用
```javascript
import rxLoop from 'rxloop';
const app = rxLoop();
```

## app.model(model)
初始化 model
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
});
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
```javascript
app.dispatch({
  type: 'counter/increment',
});
```