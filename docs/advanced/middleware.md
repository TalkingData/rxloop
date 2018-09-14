# 插件
在初始化应用时，可以根据需要配置一些插件。

```javascript
const app = rxloop({
  plugins: [
    loading(),
    immer(),
  ],
});
```
## loading 插件

安装 loading 插件后，会自动创建一个 loading 模型，可以在全局状态下监测其它模型的 epics 状态。

```javascript
import rxloop from '@rxloop/core';
import loading from '@rxloop/loading';

const app = rxloop({
  plugins: [ loading() ],
});

app.model({
  name: 'modelA',
  state: {
    a: 1,
  },
  reducers: {
    add(state) {
      return state;
    },
  },
  epics: {
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

app.stream('loading').subscribe((loading))) => {
  console.log(loading.epics.modelA.getData);
  console.log(loading.epics.modelA.setData);
});
```

[查看 demo](https://github.com/TalkingData/rxloop/tree/master/examples/loading-plugin)

## immer 插件
插件将 [immer](https://github.com/mweststrate/immer) 的能力集成到应用中，可以以更简洁直观的方式去创建一个不可变的状态对象。

```javascript
import rxloop from '@rxloop/core';
import immer from '@rxloop/immer';

const app = rxloop({
  plugins: [ immer() ],
});

app.model({
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

## 插件开发

在插件中可订阅 core 的数据流，比如创建 Model、epic 启动和结束等。

```typescript
export interface API {
  onModel$: Observable<any>,
  onEpicStart$: Observable<any>,
  onEpicEnd$: Observable<any>,
  onEpicCancel$: Observable<any>,
  onEpicError$: Observable<any>,
}

export type Plugin = (api: API) => void;
```

插件开发示例：
```javascript
function logger() {
  return function setup({
    onModel$,
    onEpicStart$,
    onEpicEnd$,
    onEpicCancel$,
    onEpicError$,
  }) {
    onModel$.subscribe(json => console.info(json));
    onEpicStart$.subscribe(json => console.info(json));
    onEpicEnd$.subscribe(json => console.info(json));
    onEpicCancel$.subscribe(json => console.warn(json));
    onEpicError$.subscribe(json => console.error(json));
  }
}

const app = rxloop({
  plugins: [ logger() ],
});
```