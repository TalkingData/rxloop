import { mapTo } from 'rxjs/operators';
import { remove } from 'lodash-es';

export default {
  name: 'todo',
  state: {
    list: [],
  },
  reducers: {
    add(state, action) {
      return {
        ...state,
        list: [
          ...state.list,
          action.item,
        ]
      };
    },
    del(state, action) {
      const list = [
        ...state.list,
      ];
      remove(list, { id: action.id });
      return {
        ...state,
        list,
      };
    },
    list(state, action) {
      return {
        ...state,
        list: [
          ...state.list,
          ...action.list,
        ]
      };
    },
  },
  epics: {
    getList(action$) {
      return action$.pipe(
        mapTo(
          {
            type: 'list',
            list: [
              { id: 0, todo: 'list 0' },
              { id: 1, todo: 'list 1' },
              { id: 2, todo: 'list 2' },
              { id: 3, todo: 'list 3' },
            ],
          }
        )
      );
    }
  },
};