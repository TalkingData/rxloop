import { map } from 'rxjs/operators';
import rxloop, { call } from '../../../src';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 2000);
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
    getData(action$) {
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
    },
  }
};

const store = rxloop();
store.model(counter);

store.stream('counter').subscribe((state) => {
  console.log(state);
});

store.dispatch({
  type: 'counter/getData',
});

// 取消异步请求
store.dispatch({
  type: 'counter/getData/cancel',
});
