import rxloop, { decorators, Action, OperatorsMap } from '../../../';
import devTools from '@rxloop/devtools';
import { map, filter } from "rxjs/operators";
import { Observable } from 'rxjs'

const {reducer, model, pipe}=  decorators<number>()

@model(0)
class Counter {

  @reducer
  increment(state: number) {
    return state + 1;
  }

  @reducer
  decrement(state: number) {
    return state + 1;
  }

  @pipe
  incrementAsync(action$:Observable<Action>, {call}: OperatorsMap) {
    return action$.pipe(
      call(async() => {
        return 1;
      }),
      map(()=> {
        return { type: "increment" };
      })
    );
  }
}
const a = model(0)(Counter)

const app = rxloop({
  plugins: [ devTools() ]
});

app.model(a);
app.model({
  name: 'counter2',
  state: 0,
  reducers:{
    increment(state) {
      return state + 1;
    },
    decrement(state) {
      return state - 1;
    }
  }
});


app.start();

var valueEl = document.getElementById('value') as HTMLElement;
app.stream('counter').subscribe((state) => {
  valueEl.innerHTML = state;
});

document.getElementById('increment')
        .addEventListener('click', function () {
          app.dispatch({ type: 'counter/increment' })
        })

document.getElementById('decrement')
        .addEventListener('click', function () {
          app.dispatch({ type: 'counter/decrement' })
        })

document.getElementById('incrementIfOdd')
        .addEventListener('click', function () {
          if (app.getState('counter') % 2 !== 0) {
            app.dispatch({ type: 'counter/increment' })
          }
        })

document.getElementById('incrementAsync')
        .addEventListener('click', function () {
          app.dispatch({ type: 'counter/incrementAsync' })
        })