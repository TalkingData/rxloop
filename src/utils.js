export { default as isPlainObject } from 'is-plain-object';
export const isFunction = o => Object.prototype.toString.call(o) === '[object Function]';
export const isAllFunction = o => Object.keys(o).every(key => isFunction(o[key]));
