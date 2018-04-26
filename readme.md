# pipeR

## 初始化：
```javascript
const app = pipeR();
```

## model 层定义：
```javascript
const comment$ = app.model({
  name: 'comment',
  state: {
    record: 0,
    current: 0,
  },
  reducers: {
    // { type: 'add' }
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
  // { type: 'getSomeData' }
  epics: {
    getSomeData(stream$) {
      return stream$.mapTo({
        type: add,
      });
    },
    getList(stream$) {
      return stream$.mapTo({
        type: add,
      });
    },
  },
});
```

## 触发过程：
```javascript
app.dispatch({
  type: 'comment/getSomeData',
});
```