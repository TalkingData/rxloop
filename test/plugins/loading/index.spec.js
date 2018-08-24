import rxloop, { loading } from '../../../src';
import { delay, mapTo } from "rxjs/operators";

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
      return state;
    },
  },
  epics: {
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

describe('test epic loading', () => {
  test('exposes the public API', () => {
    expect(Object.keys(app1)).not.toContain('loading$');
    expect(Object.keys(app)).toContain('loading$');
  });

  test('loading state', () => {
    expect(app.getState('loading')).toEqual({
      global: 0,
      epics: {
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
    expect(app.getState('loading')).toEqual({
      global: 0,
      epics: {
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
      expect(app.getState('loading')).toEqual({
        global: 0,
        epics: {
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
