import rxloop from '@rxloop/core';
import loading from '../';
import { delay, mapTo, map } from "rxjs/operators";

const app1 = rxloop();

const app = rxloop({
  plugins: [ loading() ],
});

app.model({
  name: 'test',
  state: {
    a: 1,
  },
  reducers: {
    add(state) {
      return {
        ...state,
        a: state.a + 1,
      };
    },
  },
  pipes: {
    getData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
    setData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
    getSlowlyData(action$) {
      return action$.pipe(
        delay(2000),
        mapTo({
          type: 'add',
        }),
      );
    },
  },
});

app.stream('test').subscribe();

app.start();

describe('test pipe loading', () => {
  test('exposes the public API', () => {
    expect(Object.keys(app1)).not.toContain('loading$');
    expect(Object.keys(app)).toContain('loading$');
  });

  test('loading state', () => {
    expect(app.getState('test')).toEqual({
      a: 1,
      loading: {
        getData: false,
        getDataCounter: 0,
        setData: false,
        setDataCounter: 0,
        getSlowlyData: false,
        getSlowlyDataCounter: 0,
      },
    });
    expect(app.getState('loading')).toEqual({
      pipes: {
        test: {
          getData: false,
          getDataCounter: 0,
          setData: false,
          setDataCounter: 0,
          getSlowlyData: false,
          getSlowlyDataCounter: 0,
        },
      },
    });
  });

  test('loading test', (done) => {
    app.dispatch({
      type: 'test/getSlowlyData',
    });
    expect(app.getState('test')).toEqual({
      a: 1,
      loading: {
        getData: false,
        getDataCounter: 0,
        setData: false,
        setDataCounter: 0,
        getSlowlyData: true,
        getSlowlyDataCounter: 1,
      },
    });
    expect(app.getState('loading')).toEqual({
      pipes: {
        test: {
          getData: false,
          getDataCounter: 0,
          setData: false,
          setDataCounter: 0,
          getSlowlyData: true,
          getSlowlyDataCounter: 1,
        },
      },
    });
    setTimeout(() => {
      expect(app.getState('test')).toEqual({
        a: 2,
        loading: {
          getData: false,
          getDataCounter: 0,
          setData: false,
          setDataCounter: 0,
          getSlowlyData: false,
          getSlowlyDataCounter: 0,
        },
      });
      expect(app.getState('loading')).toEqual({
        pipes: {
          test: {
            getData: false,
            getDataCounter: 0,
            setData: false,
            setDataCounter: 0,
            getSlowlyData: false,
            getSlowlyDataCounter: 0,
          },
        },
      });
      done();
    }, 3000);
  });
});

describe('test pipe loading when error', () => {
  const app = rxloop({
    plugins: [ loading() ],
  });
  app.model({
    name: 'test',
    state: {},
    reducers: {
      add(state) {
        return state;
      }
    },
    pipes: {
      getDataError(action$) {
        return action$.pipe(
          delay(2000),
          map(() => {
            throw 'boom!';
          }),
        );
      },
    },
  });

  app.start();
  app.stream('loading').subscribe();
  let state = null;
  app.stream('test').subscribe(
    data => (state = data),
    () => {},
  );
  test('loading test', (done) => {
    app.dispatch({ type: 'test/getDataError' });
    setTimeout(() => {
      expect(state).toEqual(
        { loading: { getDataErrorCounter: 0, getDataError: false } }
      );
      expect(app.getState('loading')).toEqual({
        pipes: {
          test: {
            getDataError: false,
            getDataErrorCounter: 0,
          },
        },
      });
      done();
    }, 3000);
  });
});

describe('test pipe loading when error', () => {
  const app = rxloop({
    plugins: [ loading() ],
  });
  app.model({
    name: 'test',
    state: {
      loading: true,
    },
    reducers: {
      add(state) {
        return state;
      }
    },
    pipes: {
      getData(action$) {
        return action$.pipe(
          mapTo({
            type: 'add',
          }),
        );
      },
    },
  });

  app.start();
  app.stream('loading').subscribe();
  
  test('Should not to replace loading state', () => {
    expect(app.getState('test')).toEqual({
      loading: true,
    });
    expect(app.getState('loading')).toEqual({
      pipes: {
        test: {
          getDataCounter: 0,
          getData: false,
        }
      }
    });
  });
});