import { Observable } from 'rxjs';
import { Model, Action, OperatorsMap } from '../../';

type State = {
  name: string,
}

const state: State = {
  name: 'wxnet',
};

const user: Model = {
  state,
  name: 'user',
  reducers: {
    info(state: any) {
      return state;
    }
  },
  pipes: {
    getUserInfo(action$: Observable<Action>, { call }: OperatorsMap) {
      return action$.pipe(
        call(async () => {
          return { type: 'info' };
        }),
      );
    }
  },
};

export default user;