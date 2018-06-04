# rxLoop

rxLoop = Redux + redux-observable.

Predictable state container for JavaScript apps based on RxJS， like Redux with redux-observable middleware.

1. Using RxJS instead of Redux.
2. Easy study, only four apis: app.model、app.dispatch、app.getState、app.stream.
3. Cancel async actions easyly.

## Installation
```bash
$ npm i @rxloop/core
```

## Hello rxloop
```javascript
import { from, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import rxLoop from '@rxloop/core';

const counterModel = {
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          return from(
            // Promise
            api().catch((error) => {
              return { error };
            }),
          );
        }),
        map((data) => {
          return {
            type: 'increment',
          };
        }),
      );
    }
  }
};

const app = rxLoop();
app.model(counterModel);

app.stream('counter').subscribe((state) => {
  // this.setState(state);
});

// sync update
app.dispatch({
  type: 'counter/increment',
});

// async update
app.dispatch({
  type: 'counter/getData',
});
```

## Integration with rxjs
```javascript
// input data
of(1)
.pipe(
  map((data) => {
    return {
      type: 'counter/increment',
      data,
    };
  }),
)
.subscribe(app);

// outputs
app.counter$.pipe(
  map(() => {
    return {};
  }),
)
.subscribe((data) => {
  // this.setState(data);  
});
```

## Documentation

[rxloop](https://talkingdata.github.io/rxloop/)

## Examples

1. [Examples](https://github.com/TalkingData/rxloop/tree/master/examples)
2. [React todolist app with rxloop](https://github.com/TalkingData/rxloop-react-todos)

## Releases

[releases](https://github.com/TalkingData/rxloop/releases)

## License
MIT
