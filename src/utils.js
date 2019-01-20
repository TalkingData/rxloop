export { default as isPlainObject } from "is-plain-object";
export const isFunction = o =>
  Object.prototype.toString.call(o) === "[object Function]";
export const isAllFunction = o =>
  Object.keys(o).every(key => isFunction(o[key]));
export const noop = () => {};

export const normalizeArgsModle = function(model) {
  return function(args) {
    const normalizeArgs = typeof args === "function" ? args[AllModel]() : args;
    return model.call(this, normalizeArgs);
  };
};

//Decorator
export const AllReducers = Symbol("reducers");
export const AllPipes = Symbol("pipes");
export const AllModel = Symbol('model')

export const reducer = (target, name, descriptor) => {
  target[AllReducers] = target[AllReducers] || {};
  target[AllReducers][name] = descriptor.value;
};

export const pipe = (target, name, descriptor) => {
  target[AllPipes] = target[AllPipes] || {};
  target[AllPipes][name] = descriptor.value;
};

export const model = state => {
  return Target => {

    const reducers = Target.prototype[AllReducers] || {};
    const pipes = Target.prototype[AllPipes] || {};

    Target[AllModel] = ()=>({
      name: Target.name.replace(/^\S/, match => match.toLowerCase()),
      state: state,
      reducers,
      pipes
    })

    return Target
  };
};

export const decorators = ()=>({
  reducer,
  pipe,
  model
})