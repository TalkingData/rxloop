import rxloop, { call } from '../';
import { Subject } from 'rxjs';

const delay = (ms) => new Promise((r) => setTimeout(() => r(), ms));

describe('call pipe', () => {
  test('call pipe', (done) => {
    const test$$ = new Subject();
    test$$.pipe(
      call(async (action) => {
        await delay(500);
        return { data: 1, type: action.type };
      }),
    ).subscribe(v => {
      expect(v).toEqual({ data: 1, type: 'test/getData' });
      done();
    });
    test$$.next({ type: 'test/getData' });
  });

  test('Process error', (done) => {
    const listenerA = jest.fn();
    const store = rxloop();
    store.model({
      name: 'test',
      state: 0,
      reducers: {
        add(state) { return state },
      },
      pipes: {
        errorTest(action$, { call }) {
          return action$.pipe(
            call(async () => {
              throw 'error!';
            }),
          );
        },
      },
    });

    store.stream('test').subscribe(listenerA);

    store.dispatch({ type: 'test/errorTest' });

    setTimeout(() => {
      expect(listenerA.mock.calls.length).toBe(2);
      expect(listenerA.mock.calls[1][0]).toEqual({
        type: 'test/errorTest/error',
        error: 'error!',
        model: 'test',
        pipe: 'errorTest',
      });
      done();
    }, 500);
  });

  test('cancel process', (done) => {
    const listenerA = jest.fn()

    const test$$ = new Subject();
    test$$.pipe(
      call(async () => {
        await delay(500);
      }),
    ).subscribe(listenerA);
    const action = { type: 'test/getData' };
    action.__cancel__ = new Subject();
    action.__bus__ = new Subject();
    test$$.next(action);
    action.__cancel__.next(1);
    setTimeout(() => {
      expect(listenerA.mock.calls.length).toBe(0);
      done();
    }, 1000);
  });

});