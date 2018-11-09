import { process } from '../src/';
import { Subject } from 'rxjs';

const delay = (ms) => new Promise((r) => setTimeout(() => r(), ms));

describe('Process pipe', () => {
  test('Process pipe', (done) => {
    const test$$ = new Subject();
    test$$.pipe(
      process(async (action) => {
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
    const test$$ = new Subject();
    test$$.pipe(
      process(async () => {
        error
      }),
    ).subscribe(v => {
      expect(v.error).toBeDefined();
      done();
    });
    test$$.next({ type: 'test/getData' });
  });

  test('cancel process', (done) => {
    const listenerA = jest.fn()

    const test$$ = new Subject();
    test$$.pipe(
      process(async () => {
        await delay(500);
      }),
    ).subscribe(listenerA);
    const action = { type: 'test/getData' };
    action.__cancel__ = new Subject();
    test$$.next(action);
    action.__cancel__.next(1);
    setTimeout(() => {
      expect(listenerA.mock.calls.length).toBe(0);
      done();
    }, 1000);
  });

});