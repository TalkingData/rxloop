import rxloop from '@rxloop/core';
import devTools from '@rxloop/devtools';

const getCounterApi = () => {
  return new Promise((r) => {
    setTimeout(() => r(100), 500);
  });
};

const app = rxloop({
  plugins: [ devTools() ]
});

app.model({
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    inc(state) {
      return {
        ...state,
        counter: state.counter + 1,
      };
    },
    init(state, action) {
      return {
        ...state,
        counter: action.counter,
      };
    },
  },
  pipes: {
    getCounter(action$, { call, map, dispatch }) {
      return action$.pipe(
        call(async () => {
          return await getCounterApi();
        }),
        map((data) => {
          dispatch({
            type: 'user/info',
            user: { email: 'test@test.com' },
          });
          return {
            type: 'init',
            counter: data,
          }
        }),
      );
    }
  },
});

app.model({
  name: 'user',
  state: {
    name: 'wxnet',
    email: 'www@ddd.com',
  },
  reducers: {
    info(state, action) {
      return {
        ...state,
        ...action.user,
      };
    },
  },
});

app.start();

// const user$ = app.stream('user');
// const counter$ = app.stream('counter');

// combineLatest( user$, counter$ ).pipe(
//   map(([user, counter]) => {
//     return {
//       user,
//       counter,
//     };
//   }),
// ).subscribe(state => {
//   console.log(state);
// });

app.stream().subscribe(state => {
  console.log(state);
});

app.dispatch({
  type: 'counter/inc',
});
app.dispatch({
  type: 'counter/getCounter',
});

