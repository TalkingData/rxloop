import { from, of, empty } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';

const handler = (f) => (action) => {
  const [ model, epic ] = action.type.split('/');
  return from(f(action)).pipe(
    takeUntil(action.__cancel__ || empty()),
    catchError((error) => {
      return of({
        type: 'error',
        error,
        model,
        epic,
      });
    }),
  );
};

export const process = (f) => switchMap( handler(f) );