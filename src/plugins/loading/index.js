export function loading(
  config = {
    name: 'loading',
  }
) {
  return function init({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$ }) {
    const _model = {
      name: config.name,
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
          const epicCounterKey = `${action.epic}Counter`;
          let epicCounter = 0;
          
          if (!state.epics[action.model]) {
            let initEpics = {};
            action.epics.forEach(item => {
              initEpics[`${item}Counter`] = 0;
              initEpics[item] = false;
            });
            return {
              ...state,
              epics: {
                ...state.epics,
                [action.model]: initEpics,
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
                  ...state.epics[action.model],
                  [epicCounterKey]: 0,
                  [action.epic]: false,
                },
              }
            };
          }

          epicCounter = state.epics[action.model][epicCounterKey] + action.loading;
          return {
            ...state,
            epics: {
              ...state.epics,
              [action.model]: {
                ...state.epics[action.model],
                [epicCounterKey]: epicCounter,
                [action.epic]: (epicCounter > 0)
              },
            }
          };
        }
      }
    };
    this.model(_model);
  
    // hooks
    // 初始化 model 状态
    onModel$
    .subscribe(data => {
      this.dispatch({
        type: 'loading/modelLoading',
        model: data.model,
        loading: 0,
      });
  
      this.dispatch({
        epics: Object.keys(this._epics[data.model]),
        type: 'loading/epicLoading',
        model: data.model,
        loading: 0,
      });
    });
  
    onEpicStart$
    .subscribe(data => {
      // this.dispatch({
      //   type: 'loading/globalLoading',
      //   loading: 1,
      // });
      // this.dispatch({
      //   type: 'loading/modelLoading',
      //   model: data.model,
      //   loading: 1,
      // });
      this.dispatch({
        epic: data.epic,
        type: 'loading/epicLoading',
        model: data.model,
        loading: 1,
      });
    });
  
    onEpicEnd$
    .subscribe(data => {
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
        loading: -1,
      });
    });
  
    onEpicCancel$
    .subscribe(data => {
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
};
