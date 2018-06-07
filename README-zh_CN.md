# rxloop
[English README](README.md)
> rxloop = Redux + redux-observable.

基于 RxJS 的可预测状态管理容器，超轻量级的 “Redux + redux-observable” 架构。

1. 便于抽象前端领域模型，可自由选择多状态或单一状态树；
2. 简单易用，仅有四个 API: app.model、app.dispatch、app.getState、app.stream；
3. 使用 Epics 隔离副作用，可轻松取消 AJAX 等异步调用；
4. 扩展 RxJS，能够串联到 RxJS 数据流，并分发多个数据流。

## 安装
```bash
$ npm i @rxloop/core
```

## 快速上手
```javascript
import rxloop from '@rxloop/core';

// 一个应用创建一个全局唯一的 app
const app = rxloop();

// 在应用中，可以创建多个业务模型，比如下面的 counter 模型
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

// 在 View 层订阅 counter 模型的状态
// 当模型状态变更时，使用相关方法同步 View 的更新，比如 React 的 setState 方法
app.stream('counter').subscribe((state) => {
  // this.setState(state);
});

// 在 view 层，可以通过 dispatch 派发 action
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

关于更多的异步请求、取消请求等特性，可以翻阅文档。

## 文档

1. [快速上手](https://talkingdata.github.io/rxloop/#/basics/getting-started)
2. [错误处理](https://talkingdata.github.io/rxloop/#/basics/error-handler)
3. [与 RxJS 集成](https://talkingdata.github.io/rxloop/#/advanced/integration-with-rxjs)
4. [多状态与单一状态树](https://talkingdata.github.io/rxloop/#/advanced/multi-state-and-single-state)

## 示例

1. [Examples](https://github.com/TalkingData/rxloop/tree/master/examples)
2. [React todolist app with rxloop](https://github.com/TalkingData/rxloop-react-todos)

## 发布记录

[releases](https://github.com/TalkingData/rxloop/releases)

## 协议许可
MIT
