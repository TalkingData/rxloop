import rxloop from '@rxloop/core';
import immer from '@rxloop/immer';

const counter = {
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state) {
      state.counter = state.counter + 1;

      // no more ... and return
      // return {
      //   ...state,
      //   counter: state.counter + 1,
      // };
    },
    decrement(state) {
      state.counter = state.counter - 1;

      // no more ... and return
      // return {
      //   ...state,
      //   counter: state.counter - 1,
      // };
    },
  },
};

const app = rxloop({
  plugins: [ immer() ],
});
app.model(counter);

app.stream('counter').subscribe(state => {
  document.getElementById('counter').innerHTML = state.counter;
});

document.getElementById('increment').onclick = () => {
  app.dispatch({
    type: 'counter/increment',
  });
};

document.getElementById('decrement').onclick = () => {
  app.dispatch({
    type: 'counter/decrement',
  });
};
