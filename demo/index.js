import { mapTo } from 'rxjs/operators';
import pipeR from '../';

const app = pipeR();

app.model({
  name: 'list',
  state: {
    list: [],
  },
  reducers: {
    add(state, action) {
      return {
        ...state,
        list: [
          ...state.list,
          action.item,
        ]
      };
    },
    list(state, action) {
      return {
        ...state,
        list: [
          ...state.list,
          ...action.list,
        ]
      };
    },
  },
  epics: {
    getList(action$) {
      return action$.pipe(
        mapTo({
          type: 'list',
          list: [
            { todo: '1' },
            { todo: '2' }
          ]
        }),
      );
    },
  },
});

app.list$.subscribe((state) => {
  console.log(state);
});

app.dispatch({
  type: 'list/getList',
});

app.dispatch({
  type: 'list/add',
  item: {
    todo: '内容项目'
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
