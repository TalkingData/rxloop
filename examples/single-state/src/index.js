import rxloop from '@rxloop/core';
import { from, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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
    getCounter(action$) {
      return action$.pipe(
        switchMap(() => {
          return from( getCounterApi() );
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

app.start();

const user$ = app.stream('user');
const counter$ = app.stream('counter');

combineLatest( user$, counter$ ).pipe(
  map(([user, counter]) => {
    return {
      user,
      counter,
    };
  }),
).subscribe(state => {
  console.log(state);
});

app.dispatch({
  type: 'counter/inc',
});
app.dispatch({
  type: 'counter/getCounter',
});

