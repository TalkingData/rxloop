import rxLoop from '../src/';

describe('index', () => {
  const app = rxLoop();
  app.model({
    name: 'counter',
    state: {
      counter: 0,
    }
  });

  test('create one stream', () => {
    expect(app.counter$).not.toBeUndefined();
  });

  test('default counter is 0', () => {
    const defaultModel = app.getState('counter');
    expect(defaultModel).not.toBeUndefined();
    expect(defaultModel.counter).toBe(0);
  });
});
