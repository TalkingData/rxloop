import rxloop from '../../../src';

const counter = {
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    decrement(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
  },
  pipes: {
    getData(action$, { call, map }) {
      return action$.pipe(
        call(async () => {
          throw new Error('not login');
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    },
  }
};

const store = rxloop();
store.model(counter);

store.stream('counter').subscribe((state) => {
  if (state.error) {
    console.log(state.error);
    return;
  }
  console.log(state);
});

store.dispatch({
  type: 'counter/getData',
});

setTimeout(() => {
  store.dispatch({
    type: 'counter/getData',
  });
},1000);
