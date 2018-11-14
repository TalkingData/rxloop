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
    addAfter1Second(action$, { call, dispatch, cancel$ }) {
      return action.pipe(
        call(async () => {
          return { a: 1 };
        }),
        map((data) => {
          dispatch({
            type: 'user/getInfo',
          });
          return { ...data, b: 2 };
        }),
      );     
    },
  },
}
```
