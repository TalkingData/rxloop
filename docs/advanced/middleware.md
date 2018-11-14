# 插件
在初始化应用时，可以根据需要配置一些插件。

```javascript
const store = rxloop({
  plugins: [
    loading(),
    immer(),
  ],
});
```
## loading 插件

安装 loading 插件后，会自动创建一个 loading 模型，可以在全局状态下监测其它模型的 pipes 状态。

```javascript
import rxloop from '@rxloop/core';
import loading from '@rxloop/loading';

const store = rxloop({
  plugins: [ loading() ],
});

store.model({
  name: 'modelA',
  state: {
    a: 1,
  },
  reducers: {
    add(state) {
      return state;
    },
  },
  pipes: {
    getData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
    setData(action$) {
      return action$.pipe(
        mapTo({
          type: 'add',
        }),
      );
    },
  },
});

store.stream('loading').subscribe((loading))) => {
  console.log(loading.pipes.modelA.getData);
  console.log(loading.pipes.modelA.setData);
});
```

[查看 demo](https://github.com/TalkingData/rxloop/tree/master/examples/loading-plugin)

## immer 插件
插件将 [immer](https://github.com/mweststrate/immer) 的能力集成到应用中，可以以更简洁直观的方式去创建一个不可变的状态对象。

```javascript
import rxloop from '@rxloop/core';
import immer from '@rxloop/immer';

const store = rxloop({
  plugins: [ immer() ],
});

store.model({
  name: 'commnet',
  state: {
    list: [],
  },
  reducers: {
    add(state) {
      state.list.push({ id: 1, txt: 'text' });
    },
  },
});
```
[查看 demo](https://github.com/TalkingData/rxloop/tree/master/examples/immer-plugin)

## 插件开发

在插件中可订阅 core 的数据流，比如创建 Model、pipe 启动和结束等。

```typescript
export interface API {
  onModel$: Observable<any>,
  onPipeStart$: Observable<any>,
  onPipeEnd$: Observable<any>,
  onPipeCancel$: Observable<any>,
  onPipeError$: Observable<any>,
}

export type Plugin = (api: API) => void;
```

插件开发示例：
```javascript
function logger() {
  return function setup({
    onModel$,
    onPipeStart$,
    onPipeEnd$,
    onPipeCancel$,
    onPipeError$,
  }) {
    onModel$.subscribe(json => console.info(json));
    onPipeStart$.subscribe(json => console.info(json));
    onPipeEnd$.subscribe(json => console.info(json));
    onPipeCancel$.subscribe(json => console.warn(json));
    onPipeError$.subscribe(json => console.error(json));
  }
}

const store = rxloop({
  plugins: [ logger() ],
});
```
