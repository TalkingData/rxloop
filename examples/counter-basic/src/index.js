import pipeR from '../../../';

const counterModel = {
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

const app = pipeR();
app.model(counterModel);

var valueEl = document.getElementById('value');
app.counter$.subscribe((state) => {
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

      // document.getElementById('incrementIfOdd')
      //   .addEventListener('click', function () {
      //     if (store.getState() % 2 !== 0) {
      //       app.dispatch({ type: 'counter/increment' })
      //     }
      //   })

      // document.getElementById('incrementAsync')
      //   .addEventListener('click', function () {
      //     setTimeout(function () {
      //       app.dispatch({ type: 'counter/increment' })
      //     }, 1000)
      //   })