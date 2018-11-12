import { Subject, from, of, empty } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';

const handler = (f) => (action) => {
  const cancel$ = action.__cancel__ || empty();
  const bus$ = action.__bus__ || new Subject();

  const [ model, epic ] = action.type.split('/');
  return from(f(action)).pipe(
    takeUntil(cancel$),
    catchError((error) => {
      bus$.next({
        type: `${model}/${epic}/error`,
        error,
        model,
        epic,
      });
      return empty();
      // return of({
      //   type: 'error',
      //   error,
      //   model,
      //   epic,
      // });
    }),
  );
};

export const call = (f) => switchMap( handler(f) );