import rxloop, { loading } from '../src/';

test('export plugins', () => {
  expect(rxloop).not.toBeUndefined();
  expect(loading).not.toBeUndefined();
});
