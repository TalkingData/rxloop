import rxloop from '@rxloop/core';
import loading from '@rxloop/loading';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 1000);
  });
  return { code: 200, data };
};

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
    setData(action$, { map }){
      return action$.pipe(
        map(() => {
          return {
            type: 'increment',
          };
        }),
      );
    },
    getData(action$, { call, map }) {
      return action$.pipe(
        call(async () => {
          return await apiSlow();
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  }
};

const app = rxloop({
  plugins: [ loading() ],
});
app.model(counter);
app.start();

app.stream('counter').subscribe(state => {
  document.getElementById('counter').innerHTML = state.loading.getData ? 'loading' : state.counter;
});

// loading 状态
app.stream('loading').subscribe(state => {
  // 某个 pipe 的 loading 状态
  console.log(state.pipes.counter);
});

document.getElementById('getdata').onclick = () => {
  app.dispatch({
    type: 'counter/getData',
  });
};
