import rxloop from '../src/';
import { mapTo } from "rxjs/operators";

describe('Basic api', () => {
  test('plugin event source', () => {
    rxloop({
      plugins: [
        function pluginOne({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$ }) {
          expect(onModel$).not.toBeUndefined();
          expect(onEpicStart$).not.toBeUndefined();
          expect(onEpicEnd$).not.toBeUndefined();
          expect(onEpicCancel$).not.toBeUndefined();
        },
        function pluginTwo({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$ }) {
          expect(onModel$).not.toBeUndefined();
          expect(onEpicStart$).not.toBeUndefined();
          expect(onEpicEnd$).not.toBeUndefined();
          expect(onEpicCancel$).not.toBeUndefined();
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
});