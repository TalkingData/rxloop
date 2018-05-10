import { Observable } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { remove } from 'lodash-es';
import getList from '../services/todos';

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
    setTodoList(state, action) {
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
    // input is an action stream,
    // the action is { type: 'todo/getTodoList' }
    getTodoList(action$) {
      return action$.pipe(
        switchMap(() => {
          return Observable.fromPromise(getList());
        }),
        // need return an action, 
        // like { action: 'setTodoList', payload: {} };
        map((data) => {
          return {
            type: 'setTodoList',
            list: data.result.list,
          };
        }),
      );
    }
  },
};