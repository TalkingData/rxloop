# TypeScript

在 TypeScript 中为模型标注静态类型，可以在开发阶段避免很多错误。

```typescript
import { Model, Action } from '@rxloop/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const comment: Model = {
  name: 'comment',
  state: {
    comments: [],
  },
  reducers: {
    comments(state: any, action: Action) {
      state.comments = action.data.comments;
    },
  },
  pipes: {
    loadComments(action$: Observable<Action>): Observable<Action> {
      return action$.pipe(
        map((data: any) => {
          return {
            type: 'comments',
            data: {
              comments: [],
            },
          };
        }),
      );
    },
  },
};
export default comment;
```

##  Class style model 

```typescript
import { Action, model, reducer, pipe } from '@rxloop/core';

@model({ name: '', email: '' })
export class User {
  @reducer
  info(state: any, action: Action) { return state }

  @pipe
  getData(action$: Observable<Action>, { call, map }) {
    return action$.pipe(
      call(async (action: Action) => {
        return { name: 'wxnet' };
      }),
      map((data) => {
        return { type: 'info', data };
      }),
    );
  }

  @pipe
  setData(action$: Observable<Action>) {
    return action$.pipe();
  }
}

const app = rxloop();
app.model(User);
```