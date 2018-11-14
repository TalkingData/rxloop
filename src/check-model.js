import invariant from 'invariant';
import { isPlainObject, isAllFunction } from './utils';

export default function checkModel(model, rootState) {
  const {
    name,
    reducers,
    pipes,
  } = model;

  // name should be defined
  invariant(
    name,
    `[app.model] name should be defined`,
  );

  // name should be string
  invariant(
    typeof name === 'string',
    `[app.model] name should be string, but got ${typeof name}`,
  );

  // name should be unique
  invariant(
    rootState[name] === (void 0),
    `[app.model] name should be unique`,
  );

  // reducers should be plain object
  if (reducers) {
    invariant(
      isPlainObject(reducers),
      `[app.model] reducers should be plain object, but got ${typeof reducers}`,
    );
    invariant(
      isAllFunction(reducers),
      `[app.model] all reducer should be function`,
    );
  }

  // pipes should be plain object
  if (pipes) {
    invariant(
      isPlainObject(pipes),
      `[app.model] pipes should be plain object, but got ${typeof pipes}`,
    );
    invariant(
      isAllFunction(pipes),
      `[app.model] all pipe should be function`,
    );
  }
}