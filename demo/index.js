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
      return action$.mapTo({
        type: add,
      });
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
      return action$.mapTo({
        type: add,
      });
    },
    getList(action$) {
      return action$.mapTo({
        type: add,
      });
    },
  },
});

app.comment$.subscribe((state) => {
  console.log(state);
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
app.dispatch({
  type: 'comment/add',
  value: 1,
});
