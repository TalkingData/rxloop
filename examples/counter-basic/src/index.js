import rxloop from '@rxloop/core';
import devTools from '../../devtools';

const counter = {
  name: 'counter',
  state: 0,
  reducers: {
    increment(state) {
      return state + 1;
    },
    decrement(state) {
      return state - 1;
    }
  },
};

const app = rxloop({
  plugins: [ devTools ]
});

app.model(counter);
app.model({
  name: 'user1',
  state: {
    name: 'wxx',
  }
});
app.model({
  name: 'user2',
  state: {
    name: 'wxx',
  }
});
app.model({
  name: 'user3',
  state: {
    name: 'wxx',
  }
});

var valueEl = document.getElementById('value');
app.stream('counter').subscribe((state) => {
  valueEl.innerHTML = state;
});

document.getElementById('increment')
        .addEventListener('click', function () {
          app.dispatch({ type: 'counter/increment' })
        })

document.getElementById('decrement')
        .addEventListener('click', function () {
          app.dispatch({ type: 'counter/decrement' })
        })

document.getElementById('incrementIfOdd')
        .addEventListener('click', function () {
          if (app.getState('counter') % 2 !== 0) {
            app.dispatch({ type: 'counter/increment' })
          }
        })

document.getElementById('incrementAsync')
        .addEventListener('click', function () {
          setTimeout(function () {
            app.dispatch({ type: 'counter/increment' })
          }, 1000)
        })