function loading({ onModel$, onEpicStart$, onEpicEnd$, onEpicCancel$ }) {
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
  onModel$
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

export default loading;
