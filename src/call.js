import { Subject, from, empty } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';

const handler = (f) => (action) => {
  const cancel$ = action.__cancel__ || empty();
  const bus$ = action.__bus__ || new Subject();

  const [ model, pipe ] = action.type.split('/');
  return from(f(action)).pipe(
    takeUntil(cancel$),
    catchError((error) => {
      bus$.next({
        type: `${model}/${pipe}/error`,
        error,
        model,
        pipe,
      });
      return empty();
      // return of({
      //   type: 'error',
      //   error,
      //   model,
      //   pipe,
      // });
    }),
  );
};

export const call = (f) => switchMap( handler(f) );