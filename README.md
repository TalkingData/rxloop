# rxloop

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@rxloop/core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@rxloop/core
[download-image]: https://img.shields.io/npm/dm/@rxloop/core.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rxloop/core

[中文 README](README-zh_CN.md)
> rxloop = Redux + redux-observable.

RxJS-based predictable state management container, ultra-lightweight "Redux + redux-observable" architecture.

## features
* Facilitate the abstract front-end domain model, free choice of multi-state or single state tree;
* Easy to learn and use: Only four apis, friendly to Redux and RxJS;
* Isolation side effects: using the asynchronous processing capabilities of RxJS, free combination, cancel AJAX and other asynchronous calls in the Epics;
* Extensions RxJS: rxloop can be cascaded into RxJS data pipelines, eventually distributing multiple data pipes.

## Installation
Via npm:
```bash
$ npm install @rxloop/core
```

Or yarn
```bash
$ yarn add @rxloop/core
```

Or introduced through CDN
```html
<script src="https://unpkg.com/@rxloop/core@0.6.1/dist/rxloop-core.min.js"></script>
<script src="https://unpkg.com/rxjs@6.2.0/bundles/rxjs.umd.min.js"></script>
<script>
var app = rxloopCore();
app.model({
  name: 'user',
  state: { name: 'wxnet' }
});
</script>
```

## Hello rxloop
```javascript
import rxloop from '@rxloop/core';

// Create a globally unique app in one application
const app = rxloop();

// In the application, 
// you can create multiple business models,
// such as the following user and counter models
app.model({
  name: 'user',
  state: { name: 'wxnet' }
});
app.model({
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    inc(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    dec(state) {
      return {
        ...state,
        counter: state.counter - 1
      };
    },
  },
});

// Subscribe to the status of the counter model at the View level,
// When the model state changes,
// use View layer framework-related methods to synchronize View updates,
// such as React's setState method
app.stream('counter').subscribe((state) => {
  // this.setState(state);
});

// In the view layer,
// you can dispatch an action via the dispatch method
// Action updates the model state via epics or reducers
app.dispatch({
  type: 'counter/inc',
});
app.dispatch({
  type: 'counter/inc',
});
app.dispatch({
  type: 'counter/dec',
});
```

For more features such as asynchronous requests, cancellation requests, etc.,
you can read through the documentation 👇.

## Documentation

1. [Quick start](https://talkingdata.github.io/rxloop/#/basics/getting-started)
2. [Error handling](https://talkingdata.github.io/rxloop/#/basics/error-handler)
3. [Integration with RxJS](https://talkingdata.github.io/rxloop/#/advanced/integration-with-rxjs)
4. [Multi-state and single-state trees](https://talkingdata.github.io/rxloop/#/advanced/multi-state-and-single-state)

## Examples

1. [Examples](https://github.com/TalkingData/rxloop/tree/master/examples)
2. [React todolist app with rxloop](https://github.com/TalkingData/rxloop-react-todos)

## Releases

1. [counter-basic](https://github.com/TalkingData/rxloop/tree/master/examples/counter-basic)
2. [ajax-cancel](https://github.com/TalkingData/rxloop/tree/master/examples/ajax-cancel)
3. [error-handler](https://github.com/TalkingData/rxloop/tree/master/examples/error-handler)
4. [React todolist app with rxloop](https://github.com/TalkingData/rxloop-react-todos)

## License
MIT
