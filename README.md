简体中文 | [English](README-en_US.md)
# rxloop [![NPM version][npm-image]][npm-url] [![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@rxloop/core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@rxloop/core
[download-image]: https://img.shields.io/npm/dm/@rxloop/core.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rxloop/core


> rxloop = Redux + redux-observable.

基于 RxJS 的可预测状态管理容器，超轻量级的 “redux + redux-observable” 架构。

## 特性
* elm 概念：通过 reducers、epics 组织 model，支持多状态或单一状态树；
* 易学易用：仅有五个 api，对 Redux、RxJS 用户友好；
* 插件机制：比如 [@rxloop/loading](https://github.com/TalkingData/rxloop-loading) 可以自动处理 loading 状态，[@rxloop/devtools](https://github.com/TalkingData/rxloop-devtools) 可视化状态树，便于代码调试；
* 扩展 RxJS：rxloop 能够串联到 RxJS 数据管道之中，最终能够分发出多个数据管道。

## 安装
**`rxjs` 需要作为 peer dependency 引入。**

通过 npm 方式：
```bash
$ npm install @rxloop/core rxjs
```

或者 yarn 方式
```bash
$ yarn add @rxloop/core rxjs
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

## 更多示例

1. [基本的计数器](https://codesandbox.io/s/mz6yyw17vy)
4. [单一状态和多状态树](https://codesandbox.io/s/348w57x936)
4. [错误处理](https://codesandbox.io/s/0qmn89noj0)
3. [取消异步请求](https://codesandbox.io/s/3vy8ox7zx5)
2. [使用 react-redux 绑定 rxloop](https://codesandbox.io/s/y3www03181)
5. [任务列表应用](https://codesandbox.io/s/ypwo37zmo1)
5. [loading 插件](https://codesandbox.io/s/8l1mnx18v2)
5. [immer 插件](https://codesandbox.io/s/343wrnq6pp)


## [文档索引](https://github.com/TalkingData/rxloop/blob/master/docs/sidebar.md)

- [介绍](https://github.com/TalkingData/rxloop/blob/master/docs/index.md)
- [基础](https://github.com/TalkingData/rxloop/blob/master/docs/basics/index.md)
  - [快速上手](https://github.com/TalkingData/rxloop/blob/master/docs/basics/getting-started.md)
  - [错误处理](https://github.com/TalkingData/rxloop/blob/master/docs/basics/error-handler.md)
  - [示例](https://github.com/TalkingData/rxloop/blob/master/docs/basics/examples.md)
- [高级特性](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/index.md)
  - [请求取消](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/cancellation.md)
  - [与 RxJS 集成](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/integration-with-rxjs.md)
  - [多状态与单一状态树](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/multi-state-and-single-state.md)
  - [在 Model 之间传递消息](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/cross-model-dispatch-action.md)
  - [中间件](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/middleware.md)
  - [TypeScript](https://github.com/TalkingData/rxloop/blob/master/docs/advanced/typescript.md)
- [API](https://github.com/TalkingData/rxloop/blob/master/docs/api.md)
- [更新记录](https://github.com/TalkingData/rxloop/blob/master/CHANGELOG.md)

## 协议许可
MIT
