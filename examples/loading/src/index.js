import { from } from 'rxjs';
import { mergeMap, switchMap, map, takeUntil, filter } from 'rxjs/operators';
import rxLoop from '../../../src/';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 2000);
  });
  return { code: 200, data };
};

const counterModel = {
  name: 'counter',
  state: {
    error: '',
    counter: 0,
  },
  reducers: {
    increment(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    decrement(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    handleError(state, action) {
      return {
        ...state,
        error: action.error,
      };
    },
  },
  epics: {
    getData(action$, cancel$) {
      return action$.pipe(
        mergeMap(() => {
          return from(
            apiSlow().catch((error) => {
              return { error };
            }),
          )
          .pipe(
            takeUntil(cancel$),
          );
        }),
        map((data) => {
          if (data.error) {
            return {
              error: data.error,
              type: 'handleError',
            };
          }
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  }
};

const loading = function loading() {
  const _model = {
    name: 'loading',
    state: {
      global: 0,
      epics: {},
    },
    reducers: {
      globalLoading(state, action) {
        return {
          ...state,
          global: state.global + action.loading,
        };
      },
      modelLoading(state, action) {
        if (!state[action.model]) {
          return {
            ...state,
            [action.model]: 0,
          };
        }
        return {
          ...state,
          [action.model]: state[action.model] + action.loading,
        };
      },
      epicLoading(state, action) {
        if (!state.epics[action.model]) {
          return {
            ...state,
            epics: {
              ...state.epics,
              [action.model]: {
                [action.epic]: 0,
              },
            }
          };
        }
        if (action.isCancel) {
          return {
            ...state,
            global: state.global - state.epics[action.model][action.epic],
            [action.model]: state[action.model] - state.epics[action.model][action.epic],
            epics: {
              ...state.epics,
              [action.model]: {
                [action.epic]: 0,
              },
            }
          };
        }
        return {
          ...state,
          epics: {
            ...state.epics,
            [action.model]: {
              [action.epic]: state.epics[action.model][action.epic] + action.loading
            },
          }
        };
      }
    }
  };
  this.model(_model);

  // hooks
  // 初始化 model 状态
  this.plugin$.pipe( filter(e => e.action === 'onModel') )
  .subscribe(data => {
    this.dispatch({
      type: 'loading/modelLoading',
      model: data.model,
      loading: 0,
    });

    Object.keys(this._epics[data.model]).forEach(epic => {
      this.dispatch({
        epic,
        type: 'loading/epicLoading',
        model: data.model,
        loading: 0,
      });
    });
  });

  this.plugin$.pipe( filter(e => e.action === 'onEpicStart') )
  .subscribe(data => {
    this.dispatch({
      type: 'loading/globalLoading',
      loading: 1,
    });
    this.dispatch({
      type: 'loading/modelLoading',
      model: data.model,
      loading: 1,
    });
    this.dispatch({
      epic: data.epic,
      type: 'loading/epicLoading',
      model: data.model,
      loading: 1,
    });
  });

  this.plugin$.pipe( filter(e => e.action === 'onEpicEnd') )
  .subscribe(data => {
    this.dispatch({
      type: 'loading/globalLoading',
      loading: -1,
    });
    this.dispatch({
      type: 'loading/modelLoading',
      model: data.model,
      loading: -1,
    });
    this.dispatch({
      epic: data.epic,
      type: 'loading/epicLoading',
      model: data.model,
      loading: -1,
    });
  });

  this.plugin$.pipe( filter(e => e.action === 'onEpicCancel') )
  .subscribe(data => {
    console.log(data);
    // this.dispatch({
    //   type: 'loading/globalLoading',
    //   loading: -1,
    // });
    // this.dispatch({
    //   type: 'loading/modelLoading',
    //   model: data.model,
    //   loading: -1,
    // });
    this.dispatch({
      epic: data.epic,
      type: 'loading/epicLoading',
      model: data.model,
      loading: 0,
      isCancel: true,
    });
  });
};

const app = rxLoop({
  plugins: [ loading ],
});
app.model(counterModel);

// 全局
app.stream('loading').subscribe(state => {
  console.log(state);
  // 某个 epic 的 loading 状态
  // state.epics.counter.getData

  // 某个 model 的 loading 状态，支持获取异步个数
  // state.counter

  // 整个应用的 loading 状态，支持获取异步个数
  // state.global
});

app.stream('counter').subscribe((state) => {
  // console.log(state);
  // 局部
  // state.loading.getData
});

// switchMap 连续调用取消请一次异步请求
// https://ithelp.ithome.com.tw/articles/10188387
app.dispatch({
  type: 'counter/getData',
});

app.dispatch({
  type: 'counter/getData',
});

app.dispatch({
  type: 'counter/getData',
});

// 取消异步请求
app.dispatch({
  type: 'counter/getData/cancel',
});
