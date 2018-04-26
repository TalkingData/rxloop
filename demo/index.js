import pipeR from '../';

const app = pipeR();

app.model({
  name: 'list',
  state: {
    list: [],
  },
  reducers: {
    add(state) {},
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
  type: 'comment/getSomeData',
});
