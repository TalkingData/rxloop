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
  epics: {
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