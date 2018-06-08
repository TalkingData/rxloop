# rxloop

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/flclover.svg?style=flat-square
[npm-url]: https://npmjs.org/package/flclover
[download-image]: https://img.shields.io/npm/dm/flclover-init.svg?style=flat-square
[download-url]: https://npmjs.org/package/flclover

[English README](README.md)
> rxloop = Redux + redux-observable.

基于 RxJS 的可预测状态管理容器，超轻量级的 “Redux + redux-observable” 架构。

## 特性
* 便于抽象前端领域模型，可自由选择多状态或单一状态树；
* 易学易用：仅有四个 api，对 Redux、RxJS 用户友好；
* 隔离副作用：在 Epics 中借助 RxJS 的异步处理能力，自由组合、取消 AJAX 等异步调用；
* 扩展 RxJS：rxloop 能够串联到 RxJS 数据管道之中，最终能够分发出多个数据管道。

## 安装
通过 npm 方式：
```bash
$ npm install @rxloop/core
```

或者 yarn 方式
```bash
$ yarn add @rxloop/core
```

通过 CDN 方式引入
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

## 快速上手
```javascript
import rxloop from '@rxloop/core';

// 在一个应用创建一个全局唯一的 app
const app = rxloop();

// 在应用中，可以创建多个业务模型，比如下面的 user 和 counter 模型
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

// 在 View 层订阅 counter 模型的状态
// 当模型状态变更时，使用 View 层框架相关方法同步 View 的更新，比如 React 的 setState 方法
app.stream('counter').subscribe((state) => {
  // this.setState(state);
});

// 在 view 层，可以通过 dispatch 方法派发 action
// action 会经由 epics 或 reducers 更新 model 状态
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

关于更多的异步请求、取消请求等特性，可以翻阅文档 👇。

## 文档

1. [快速上手](https://talkingdata.github.io/rxloop/#/basics/getting-started)
2. [错误处理](https://talkingdata.github.io/rxloop/#/basics/error-handler)
3. [与 RxJS 集成](https://talkingdata.github.io/rxloop/#/advanced/integration-with-rxjs)
4. [多状态与单一状态树](https://talkingdata.github.io/rxloop/#/advanced/multi-state-and-single-state)

## 示例

1. [counter-basic](https://github.com/TalkingData/rxloop/tree/master/examples/counter-basic)
2. [ajax-cancel](https://github.com/TalkingData/rxloop/tree/master/examples/ajax-cancel)
3. [error-handler](https://github.com/TalkingData/rxloop/tree/master/examples/error-handler)
4. [React todolist app with rxloop](https://github.com/TalkingData/rxloop-react-todos)

## 协议许可
MIT
