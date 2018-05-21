import invariant from 'invariant';

export default function checkModel(model, rootState) {
  invariant(true, 'testtest');
  const {
    name,
    reducers,
    epics,
  } = model;

  // name 必须被定义
  invariant(
    name,
    `[app.model] name should be defined`,
  );

  // 并且是字符串
  invariant(
    typeof name === 'string',
    `[app.model] name should be string, but got ${typeof name}`,
  );

  // 并且唯一
  invariant(
    rootState[name] === (void 0),
    `[app.model] name should be unique`,
  );
}