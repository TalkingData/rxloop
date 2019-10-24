import rxloop from '@rxloop/core';
import devTools from '@rxloop/devtools';

const filter = {
  name: 'filter',
  state: {
    city: 0,
  },
  reducers: {
    selectCity(state, action) {
      return {
        city: action.city,
      };
    },
  },
};

const chart = {
  name: 'chart',
  state: {
    list: [],
  },
  reducers: {
    setList(state, action) {
      return {
        list: action.list,
      };
    },
  },
  subscriptions: {
    model(source, { dispatch }) {
      source('filter/selectCity').subscribe((action) => {
        dispatch({
          type: 'chart/setList',
          list: [1,2,3],
        });
      });
    },
  },
};

const table = {
  name: 'table',
  state: {
    list: [],
  },
  reducers: {
    setList(state, action) {
      return {
        list: action.list,
      };
    },
  },
  subscriptions: {
    model(source, { dispatch }) {
      source('filter/selectCity').subscribe((action) => {
        dispatch({
          type: 'chart/setList',
          list: [4,5,6],
        });
      });
    },
  },
};

const store = rxloop({
  plugins: [ devTools() ]
});

[filter, chart, table].forEach(model => store.model(model));

store.start();


store.stream('chart').subscribe((data) => {
  console.log(data);
});
store.stream('table').subscribe((data) => {
  console.log(data);
});

document.getElementById('city').onchange = () => {
  store.dispatch({
    type: 'filter/selectCity',
    city: 1,
  });
};
