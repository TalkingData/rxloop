# 异常处理

rxloop 支持应用和模型两个级别的错误处理，所有模型的异常会汇总到应用的 onError 钩子函数之中，在订阅模型数据时，可以单独检测该模型的异常情况，具体用法可以参考下面代码的注释：

```javascript
import { from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import rxloop from '@rxloop/core';

// 模拟异常接口，后面会在 counter 模型中调用这个接口。
// 调用时接口直接抛出异常信息。
const apiCrashed = async () => {
  throw new Error('Http Error');
};

// 在创建应用时，
// 可以注册全局的 onError 事件，能够统一监听到应用中所有模型的异常信息，在这里可以将应用异常上报监控服务。
const app = rxloop({
  onError(err) {
    console.log('Global error handler...');
    console.log(err);
    // 上报异常信息到监控服务
  },
});

// 定义简单的 counter 模型
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
    },
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          // 这里调用接口时，api 服务崩溃了
          return from( apiCrashed() );
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  },
});

// 订阅 counter 模型的数据流
app.stream('counter').subscribe(
  (state) => {
    console.log(state);
  },
  // 除了全局的异常处理，还可以单独处理 counter 模型的异常。
  (err) => {
    console.log('Model error handler...');
    console.log(err);
  },
);

app.dispatch({
  type: 'counter/getData',
});
```

运行代码，会在控制台中看到全局和模型两个级别的异常信息：
```
Global error handler...
index.js:52 Objectepic: "getData"error: Error: Http Error
    at apiCrashed (webpack:///./src/index.js?:10:9)
    at MergeMapSubscriber.action$.pipe.Object [as project] (webpack:///./src/index.js?:36:69)
    at MergeMapSubscriber._tryNext (webpack:///./node_modules/rxjs/_esm5/internal/operators/mergeMap.js?:71:27)
    at MergeMapSubscriber._next (webpack:///./node_modules/rxjs/_esm5/internal/operators/mergeMap.js?:61:18)
    at MergeMapSubscriber.Subscriber.next (webpack:///./node_modules/rxjs/_esm5/internal/Subscriber.js?:64:18)
    at FilterSubscriber._next (webpack:///./node_modules/rxjs/_esm5/internal/operators/filter.js?:42:30)
    at FilterSubscriber.Subscriber.next (webpack:///./node_modules/rxjs/_esm5/internal/Subscriber.js?:64:18)
    at Subject.next (webpack:///./node_modules/rxjs/_esm5/internal/Subject.js?:58:25)
    at Object.dispatch (webpack:///./node_modules/@rxloop/core/es/rxloop-core.js?:202:10)
    at eval (webpack:///./src/index.js?:94:5)model: "counter"__proto__: Object

index.js:76 Model error handler...
index.js:77 Error: Http Error
    at apiCrashed (index.js:10)
    at MergeMapSubscriber.action$.pipe.Object [as project] (index.js:36)
    at MergeMapSubscriber._tryNext (mergeMap.js:71)
    at MergeMapSubscriber._next (mergeMap.js:61)
    at MergeMapSubscriber.Subscriber.next (Subscriber.js:64)
    at FilterSubscriber._next (filter.js:42)
    at FilterSubscriber.Subscriber.next (Subscriber.js:64)
    at Subject.next (Subject.js:58)
    at Object.dispatch (rxloop-core.js:202)
    at eval (index.js:94)
```

大家还可以到 examples 目录中，查看异常处理 demo：

[https://github.com/TalkingData/rxloop/tree/master/examples/error-handler](https://github.com/TalkingData/rxloop/tree/master/examples/error-handler)
