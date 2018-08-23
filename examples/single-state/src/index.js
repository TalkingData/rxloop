import rxLoop from '@rxloop/core';
import { Observable, of, from, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

const getCounterApi = () => Promise.resolve(100);

const app = rxLoop();

app.model({
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    inc(state, action) {
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
  epics: {
    getCounter(action$, cancel$) {
      return action$.pipe(
        switchMap(() => {
          return from(
            getCounterApi()
          );
        }),
        map((data) => {
          this.dispatch({
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

const user$ = app.stream('user');
const counter$ = app.stream('counter');

combineLatest(
  user$,
  counter$,
)
.pipe(
  map(([user, counter]) => {
    return {
      user,
      counter,
    };
  }),
)
.subscribe(state => {
  console.log(state);
});

// counter$.subscribe((state) => {
//   console.log(state);
//   // this.setState(state);
// });

app.dispatch({
  type: 'counter/getCounter',
});

app.dispatch({
  type: 'counter/inc',
});
// app.dispatch({
//   type: 'counter/inc',
// });
// app.dispatch({
//   type: 'counter/inc',
// });
// app.dispatch({
//   type: 'counter/inc',
// });
