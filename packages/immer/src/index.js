import produce from "immer";
import cloneDeep from 'lodash/fp/cloneDeep';

export default function rxloopImmer() {
  return function init() {
    function createReducer(action = {}, reducer = () => {}) {
      return (state) => {
        try {
          const rtn = produce(state, draft => {
            const compatiableRet = reducer(draft, action);
            if (compatiableRet !== undefined) {
              // which means you are use redux pattern
              // it's compatiable. https://github.com/mweststrate/immer#returning-data-from-producers
              return compatiableRet;
            }
          });
          return rtn === undefined ? {} : rtn;
        } catch(e) {
          // 在 Vue 下开启 rxloop-immer 插件
          // 当对数组执行 push、unshift、splice 三个方法时会报错
          // 这个时候降级为深拷贝方式
          if(e.toString().indexOf('observeArray')) {
            console.warn('Downgrade to deepclone when call methods: push、unshift、splice in Vue');
            const draft = cloneDeep(state);
            reducer(draft, action);
            return Object.freeze(draft);
          }
          throw e;
        }
      }
    }
    this.createReducer = createReducer;
  };
};