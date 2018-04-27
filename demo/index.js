import { mapTo } from 'rxjs/operators';
import pipeR from '../';

const app = pipeR();

app.model({
  name: 'list',
  state: {
    list: [],
  },
  reducers: {
    add(state) {
      return state;
    },
  },
  epics: {
    getList(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
  },
});

app.model({
  name: 'comment',
  state: {
    record: 0,
    current: 0,
  },
  reducers: {
    // { type: 'comment/add' }
    add(state, action) {
      // console.log('add');
      // console.log(state);
      // console.log(action);
      return {
        ...state,
        record: action.value + state.record,
      };
    },
  },
  // { type: 'getSomeData' }
  epics: {
    getSomeData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
          value: 10,
        }),
      );
    },
    getList(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
          value: 100,
        })
      );
    },
  },
});

// 订阅更新
app.comment$.subscribe((state) => {
  console.log(state);
});

// 同步更新
app.dispatch({
  type: 'comment/add',
  value: 1,
});
app.dispatch({
  type: 'comment/add',
  value: 1,
});
app.dispatch({
  type: 'comment/add',
  value: 1,
});
app.dispatch({
  type: 'comment/add',
  value: 1,
});

// 异步更新
app.dispatch({
  type: 'comment/getSomeData',
  value: 1,
});

app.dispatch({
  type: 'comment/getList',
  value: 1,
});
