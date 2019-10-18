import rxloop from '@rxloop/core';
import immer from '../';

const store = rxloop({
  plugins: [
    immer(),
  ],
});

const testState = {
  a: 1,
  arr: [1],
};

store.model({
  name: 'test',
  state: testState,
  reducers: {
    add(state) {
      delete state.__action__;
      state.a = 2;
    },
    arr(state) {
      delete state.__action__;
      state.arr.push(2);
    },
  },
});
store.stream('test').subscribe();

describe('Basic usage', () => {
  test('immer number', () => {
    store.dispatch({
      type: 'test/add',
    });
    expect(testState).toEqual({
      a: 1,
      arr: [1],
    });
    expect(store.getState('test')).toEqual({
      a: 2,
      arr: [1],
    });
  });
  test('immer array', () => {
    store.dispatch({
      type: 'test/arr',
    });
    expect(testState).toEqual({
      a: 1,
      arr: [1],
    });
    expect(store.getState('test')).toEqual({
      a: 2,
      arr: [1, 2],
    });
  });
});
