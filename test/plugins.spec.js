import rxloop from '../src/';
import { from } from 'rxjs';
import { mapTo, map, takeUntil, switchMap } from "rxjs/operators";

describe('Basic api', () => {
  test('plugin event source', () => {
    rxloop({
      plugins: [
        function pluginOne({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$, onEpicError$ }) {
          expect(onModel$).not.toBeUndefined();
          expect(onEpicStart$).not.toBeUndefined();
          expect(onEpicEnd$).not.toBeUndefined();
          expect(onEpicCancel$).not.toBeUndefined();
          expect(onEpicError$).not.toBeUndefined();
        },
        function pluginTwo({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$, onEpicError$ }) {
          expect(onModel$).not.toBeUndefined();
          expect(onEpicStart$).not.toBeUndefined();
          expect(onEpicEnd$).not.toBeUndefined();
          expect(onEpicCancel$).not.toBeUndefined();
          expect(onEpicError$).not.toBeUndefined();
        },
      ],
    });
  });

  test('Event onModel will be dispached', (done) => {
    const app = rxloop({
      plugins: [
        function pluginOne({ onModel$ }) {
          onModel$.subscribe((data) => {
            expect(data).toEqual({
              type: 'plugin',
              action: 'onModel',
              model: 'test'
            });
            done();
          });
        },
      ],
    });
    app.model({ name: 'test', state: {} });
  });

  test('Event onEpicStart will be dispached', (done) => {
    const app = rxloop({
      plugins: [
        function pluginOne({ onEpicStart$ }) {
          onEpicStart$.subscribe((data) => {
            expect(data).toEqual({
              type: 'plugin',
              action: "onEpicStart",
              model: 'test',
              epic: "getData",
              data: {
                type: "test/getData",
              },
            });
            done();
          });
        },
      ],
    });

    app.model({
      name: 'test',
      state: {},
      reducers: {
        add(state) { return state },
      },
      epics: {
        getData(action$) {
          return action$.pipe(
            mapTo({
              type: 'add',
            }),
          );
        },
      },
    });
    app.dispatch({
      type: 'test/getData',
    });
  });

  test('Event onEpicEnd will be dispached', (done) => {
    const app = rxloop({
      plugins: [
        function pluginOne({ onEpicEnd$ }) {
          onEpicEnd$.subscribe((data) => {
            expect(data).toEqual({
              data: {
                type: 'add',
                payload: 1,
              },
              type: 'plugin',
              action: "onEpicEnd",
              model: 'test',
              epic: "getData",
            });
            done();
          });
        },
      ],
    });

    app.model({
      name: 'test',
      state: {},
      reducers: {
        add(state) { return state },
      },
      epics: {
        getData(action$) {
          return action$.pipe(
            mapTo({
              type: 'add',
              payload: 1,
            }),
          );
        },
      },
    });
    app.dispatch({
      type: 'test/getData',
    });
  });

  test('Event onEpicCancel will be dispached', (done) => {
    const apiSlow = async () => {
      const data = await new Promise((resolve) => {
        setTimeout(() => resolve({}), 5000);
      });
      return { code: 200, data };
    };

    const app = rxloop({
      plugins: [
        function pluginOne({ onEpicCancel$ }) {
          onEpicCancel$.subscribe((data) => {
            expect(data).toEqual({
              type: 'plugin',
              action: "onEpicCancel",
              model: 'test',
              epic: "getSlowlyData",
            });
            done();
          });
        },
      ],
    });

    app.model({
      name: 'test',
      state: {},
      reducers: {
        add(state) {
          return {
            ...state,
            a: 1,
          };
        },
      },
      epics: {
        getSlowlyData(action$, cancel$) {
          return action$.pipe(
            switchMap(() => {
              return from(apiSlow).pipe( takeUntil(cancel$) );
            }),
            mapTo({
              type: 'add',
            }),
          );
        },
      },
    });
    app.dispatch({
      type: 'test/getSlowlyData',
    });
    app.dispatch({
      type: 'test/getSlowlyData/cancel',
    });
  });

  test('Event onEpicError will be dispached', (done) => {
    const app = rxloop({
      plugins: [
        function pluginOne({ onEpicError$ }) {
          onEpicError$.subscribe((data) => {
            expect(data).toEqual({
              error: 'epic error',
              type: 'plugin',
              action: "onEpicError",
              model: 'test',
              epic: "getErrorData",
            });
            done();
          });
        },
      ],
    });

    app.model({
      name: 'test',
      state: {},
      reducers: {
        add(state) {
          return {
            ...state,
            a: 1,
          };
        },
      },
      epics: {
        getErrorData(action$) {
          return action$.pipe(
            map(() => {
              throw 'epic error';
              // return {
              //   type: 'add',
              // };
            }),
          );
        },
      },
    });
    app.dispatch({
      type: 'test/getErrorData',
    });
  });
});