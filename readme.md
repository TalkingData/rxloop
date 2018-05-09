# rxLoop

> rxLoop = Redux + redux-observable

基于 RxJS 的可预测状态容器，仅 100 行代码实现的超轻量级 Redux + redux-observable 架构。

## 特性
1. 充分利用 RxJS 的强大特性，推送数据流、易组合等特性；
2. 开发和维护效率的平衡：集中定义 model、reducers、epics，避免了在小文件之间的频繁切换修改。
3. 易学易用：仅 app.model、app.dispatch、app.getState 等几个 api。

## 安装
```bash
$ npm i rxloop --save
```

## Gist
```javascript
import rxLoop from 'rxloop';
import { mapTo } from 'rxjs/operators';

const app = rxLoop();

app.model({
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state) {
      return {
        ...state,
        counter: state.counter + 1,
      };
    },
    decrement(state) {
      return {
        ...state,
        counter: state.counter - 1,
      };
    }
  },
});

app.counter$.subscribe((state) => {
  console.log(state);
});

app.dispatch({
  type: 'counter/increment',
});

app.dispatch({
  type: 'counter/decrement',
});
```

## 实例

[examples](https://github.com/TalkingData/rxloop/tree/master/examples)

## 更新记录

[releases](https://github.com/TalkingData/rxloop/releases)

## License

MIT

