# rxLoop

> rxLoop = Redux + redux-observable

基于 RxJS V6 的状态管理容器，轻量级的 Redux + redux-observable。

特性：
1. 使用 RxJS 替换 Redux + redux-observable 架构
2. 声明式，集中定义 model、reducers、epics
3. 易于学习和使用

## 初始化
```javascript
import rxLoop from 'rxloop';
import { mapTo } from 'rxjs/operators';

const app = rxLoop();
```

## model 层定义
```javascript
app.model({
  name: 'comment',
  state: {
    record: 0,
    current: 0,
  },
  reducers: {
    // { type: 'comment/add' }
    add(state) {
      const newCurrent = state.current + 1;
      return { ...state,
        record: newCurrent > state.record ? newCurrent : state.record,
        current: newCurrent,
      };
    },
    // { type: 'minus' }
    minus(state) {
      return { ...state, current: state.current - 1};
    },
  },
  // { type: 'comment/getSomeData' }
  epics: {
    getSomeData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
    getList(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
  },
});
```

## 订阅数据流
```javascript
// 订阅更新
app.comment$.subscribe((state) => {
  console.log(state);
});
```

## 事件派发
```javascript
app.dispatch({
  type: 'comment/getSomeData',
});
```

## 更新记录
### 0.1.0
1. 同步数据流

### 0.2.0
1. 异步数据流

### 0.4.0
1. 稳定性增强

### 0.5.0
1. 新增 getState 方法，主动获取数据源
