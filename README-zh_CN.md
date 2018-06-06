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
import rxLoop from '@rxloop/core';
import { from, fromEvent, combineLatest } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

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
      // transform action
      // through a series of stream operators
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

// 同步更新
app.dispatch({
  type: 'counter/increment',
});

// 异步更新
app.dispatch({
  type: 'counter/getData',
});
```

## 与 RxJS 集成

### 将 rxloop 串联到 RxJS 数据流中
```javascript
// 输入数据
fromEvent(button, 'click')
.pipe(
  map((data) => {
    return {
      type: 'counter/increment',
      data,
    };
  }),
)
.subscribe(app);

// 输出
app.counter$.pipe(
  map(() => {
    return {};
  }),
)
.subscribe((data) => {
  // this.setState(data);  
});
```

### 多状态与单一状态树
```javascript
// 添加 user 模型
app.model({
  name: 'user',
  state: {
    name: 'wxnet',
    email: 'test@gmail.com',
  },
});

// 每一个模型会对应一个状态树，比如之前创建的 counter 模型。
// counter 状态树
const counter$ = app.stream('counter');
// user 状态树
const user$ = app.stream('user');

// 可以在不同的组件中，自由订阅模型状态的变更
counter$.subscribe(
  (state) => {
    // this.setState(state);
  },
  (error) => {},
);

user$.subscribe(
  (state) => {
    // this.setState(state);
  },
  (error) => {},
);

// 还可以使用 RxJS 的 combineLatest 工厂方法将多个模型合并为单一状态树。
const singleState = combineLatest(
  user$,
  counter$,
)
.pipe(
  map(([user, counter]) => {
    return {
      user,
      counter,
    };
  }),
);

singleState.subscribe(
  (state) => {
    // this.setState(state);
  },
  (error) => {},
);
```

## 文档

[rxloop](https://talkingdata.github.io/rxloop/)

## 示例

1. [Examples](https://github.com/TalkingData/rxloop/tree/master/examples)
2. [React todolist app with rxloop](https://github.com/TalkingData/rxloop-react-todos)

## 发布记录

[releases](https://github.com/TalkingData/rxloop/releases)

## 协议许可
MIT
