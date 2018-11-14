# 基础概念

1. View：应用的视图层
2. State：一个对象，保存整个应用状态
3. Action：一个对象，描述事件
4. dispatch 方法：一个函数，发送 Action 到 State
5. Model：一个对象，用于组织应用的逻辑关系

## State 和 View

State 是储存数据的地方，收到 Action 以后，会更新数据。
View 是由组件构成的 UI 层，订阅 Model 推送的 State ，渲染成 HTML 代码，只要 State 有变化，View 就会自动更新。

## Action

```json
{
  type: 'submit',
  payload: {}
}
```
## dispatch 方法

dispatch 是一个函数方法，用来将 Action 发送给 State。

```javascript
dispatch({
  type: 'submit',
  payload: {}
})
```

## model 对象

```javascript
{
  name: 'count',
  state: 0,
  reducers: {
    add(state) { return state + 1 },
  },
  epics: {
    addAfter1Second(action$, { call, dispatch, put }) {
      return action.pipe(
        call(async () => {
          await delay(1000);
          return { a: 1 };
        }),
        map((data) => {
          // or put
          dispatch({
            type: 'user/getInfo',
          });
          return { type: 'add', data };
        }),
      );     
    },
  },
}
```

1. name: 当前 Model 的名称。整个应用的 State，由多个小的 Model 的 State 以 name 为 key 合成
2. state: 该 Model 当前的状态。数据保存在这里，直接决定了视图层的输出
3. reducers: Action 处理器，处理同步动作，用来算出最新的 State
4. epics：Action 处理器，处理异步动作

### Reducer

Reducer 是 Action 处理器，用来处理同步操作，可以看做是 state 的计算器。它的作用是根据 Action，从上一个 State 算出当前 State。

### Epic
Action 处理器，处理副作用,根据函数式编程，计算以外的操作都属于 Effect，典型的就是 I/O 操作、数据库读写。