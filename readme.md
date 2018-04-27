# pipeR

## 初始化
```javascript
import pipeR from 'piper';
import { mapTo } from 'rxjs/operators';

const app = pipeR();
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
          type: 'comment/add',
        }),
      );
    },
    getList(action$) {
      return action$.pipe(
        mapTo({
          type: 'comment/add',
        }),
      );
    },
  },
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
2. 异步数据流
