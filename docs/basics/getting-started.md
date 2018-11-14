# 快速上手

本篇会从安装 rxloop 开始，逐步深入到同步、异步、组合和订阅 model 的状态。

## 安装
```bash
$ npm i @rxloop/core rxjs
```
或
```bash
$ yarn add @rxloop/core rxjs
```

## 在项目中引入
除了 rxloop 之前，往往还需要引入 RxJS 的很多操作符。

```javascript
import rxloop from '@rxloop/core';
import { combineLatest } from 'rxjs';
import { switchMap, map, mapTo } from 'rxjs/operators';
```

接着，使用 rxloop 函数创建一个应用：

```javascript
const store = rxloop();
```

## 创建 Model
rxloop 不强制状态树的唯一性，这一点跟 Redux 不同，推荐的方式是按业务的领域模型划分不同的 model，使用 model 方法创建不同的 model。

```javascript
// 创建 todos 的模型
store.model({
  name: 'todos',
  state: {
    list: [],
  },
});

// 创建用户模型
store.model({
  name: 'user',
  state: {
    name: '',
    email: '',
  },
});
```
model 的 name 要求全局唯一，执行两次 model 方法后，会自动创建 两个 RxJS 数据流。

## 创建 Reducers
rxloop 中的 reducer 跟 Redux 中是一致的，reducer 是一个原则单一的纯函数。

在 flux 架构中，不允许直接修改  Model 的数据，需要在 View 层中，派发 action，通过 reducer 来修改。

这里仅以 todos 的模型为例，一个名叫 setList 的 reducer 像 model 中添加一个列表数据。

```javascript
store.model({
  name: 'todos',
  state: {
    list: [],
  },
  reducers: {
    setList(state, action) {
      return {
        ...state,
        list: [
          ...state.list,
          ...action.list,
        ]
      };
    },
    // other...
  },
});
```

除 setList 之外，还可以添加更多的 reducer。 

## 创建 pipes
rxloop 将业务中所有的副作用，隔离在 pipes 中，一个 pipe 是一个纯函数，函数的第一个参数是一个输入流，在 pipe 内部，可以使用 RxJS 的 pipe 串联、组合不同的异步逻辑。

数据流最终 map 的数据，必须符合 action 的规范，关联到不同的 reducer：

```javascript
getTodos(action$) {
  return action$.pipe(
    // other pipe method..
    mapTo({
      action: 'setList',
      list: [],
    }),
  );
}
```

完整大代码如下：

```javascirpt
store.model({
  name: 'todos',
  state: {
    list: [],
  },
  reducers: {
    setList(state, action) {
      return {
        ...state,
        list: [
          ...state.list,
          ...action.list,
        ]
      };
    },
    // other...
  },
  epcis: {
    getTodos(action$) {
      return action$.pipe(
        // other pipe method..
        mapTo({
          action: 'setList',
          list: [],
        }),
      );
    },
    // other...
  },
});
```

## 订阅状态变更

执行 `app.model` 方法会创建一个以model name 为名称的 RxJS 数据流，在业务代码里，可以订阅这些数据流，然后更新 View 的状态。

```javascript
store.stream('todos').subscribe((state) => {
  // ....
  // this.setState(state);
});
```

当然也可以通过 RxJS 的操作符，对这些数据流做进一步的操作，上面的代码创建了 `store.stream('todo')` 和 `store.stream('user')` 两个数据流。

```javascript
const state$ = combineLatest(store.stream('todo'), store.stream('user'));
state$.subscribe((state) => {
  // this.setState(state);
});
```

## 派发事件
rxloop 通过 dispatch 方法派发 action，来修改 model 的数据，这一点跟 Redux 是一致的，不同的是 rxloop 支持创建多个状态树，在 model 外部派发事件时，需要指定具体的 model name：

```javascript
// 出发 todos model 中的 pipes
store.dispatch({
  type: 'todos/getTodos',
  params: {},
});
```
