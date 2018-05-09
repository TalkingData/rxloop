import rxLoop from '../src/';

describe('index', () => {
  const app = rxLoop();
  app.model({
    name: 'counter',
    state: {
      counter: 0,
    },
    reducers: {
      increment(state) {
        return {
          ...state,
          counter: state.counter + 1,
        };
      },
      decrement(state) {
        return {
          ...state,
          counter: state.counter - 1,
        };
      }
    },
  });

  test('exposes the public API', () => {
    const apis = Object.keys(app);

    expect(apis).toContain('counter$');
    expect(apis).toContain('dispatch');
    expect(apis).toContain('getState');
  });

  test('throws if is not pass a name', () => {
    expect(() => app.getState()).toThrow()
  });

  test('default state is { counter: 0 }', () => {
    expect(app.getState('counter')).toEqual({
      counter: 0,
    });
  });

  test('dispatch increment: state is { counter: 3 }', () => {
    app.dispatch({
      type: 'counter/increment',
    });
    app.dispatch({
      type: 'counter/increment',
    });
    app.dispatch({
      type: 'counter/increment',
    });
    expect(app.getState('counter')).toEqual({
      counter: 3,
    });
  });

  test('dispatch increment: state is { counter: 1 }', () => {
    app.dispatch({
      type: 'counter/decrement',
    });
    app.dispatch({
      type: 'counter/decrement',
    });
    expect(app.getState('counter')).toEqual({
      counter: 1,
    });
  });
});
