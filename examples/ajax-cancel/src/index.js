import { from } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import rxloop from '@rxloop/core';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 5000);
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
  epics: {
    getData(action$, cancel$) {
      return action$.pipe(
        switchMap(() => {
          return from( apiSlow() )
                .pipe( takeUntil(cancel$) );
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

const app = rxloop();
app.model(counter);

app.stream('counter').subscribe((state) => {
  console.log(state);
});

app.dispatch({
  type: 'counter/getData',
});

// 取消异步请求
app.dispatch({
  type: 'counter/getData/cancel',
});
