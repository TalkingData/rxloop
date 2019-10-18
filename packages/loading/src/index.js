export default function loading(
  config = {
    name: 'loading',
  }
) {
  return function init({
    onModelBeforeCreate$,
    onPipeStart$,
    onPipeEnd$,
    onPipeCancel$,
    onPipeError$,
    onStart$,
   }) {
    const _model = {
      name: config.name,
      state: {
        pipes: {},
      },
      reducers: {
        init(state, action) {
          state.pipes = action.pipes;
          return state;
        },
        pipeStart(state, action) {
          const pipeCounterKey = `${action.pipe}Counter`;
          let pipeCounter = state.pipes[action.model][pipeCounterKey] + action.loading;

          state.pipes[action.model][pipeCounterKey] = pipeCounter;
          state.pipes[action.model][action.pipe] = pipeCounter > 0;

          return state;
        },
        pipeStop(state, action) {
          const pipeCounterKey = `${action.pipe}Counter`;
          state.pipes[action.model][pipeCounterKey] = 0;
          state.pipes[action.model][action.pipe] = false;
          return state;
        },
      },
    };
    this.model(_model);
    this.stream(config.name).subscribe();

    onModelBeforeCreate$.subscribe(({ model }) => {
      if (
        typeof model.state !== 'object' ||
        !model.pipes ||
        model.state.loading !== void 0
      ) return;

      const loading = {};
      Object.keys(model.pipes).forEach(pipe => {
        loading[`${pipe}Counter`] = 0;
        loading[pipe] = false;
      });

      model.state.loading = loading;
      model.reducers.loadingStart = loadingStart;
      model.reducers.loadingEnd = loadingEnd;

      function loadingStart(state, { payload: { pipe } }) {
        const pipeCounterKey = `${pipe}Counter`;
        const pipeCounter = state.loading[pipeCounterKey] + 1
        state.loading[pipeCounterKey] = pipeCounter;
        state.loading[pipe] = pipeCounter > 0;
        return state;
      }

      function loadingEnd(state, { payload: { pipe } }) {
        state.loading[`${pipe}Counter`] = 0;
        state.loading[pipe] = false;
        return state;
      }
    });
  
    // hooks
    onStart$.subscribe(() => {
      const pipes = {};
      Object.keys(this._stream).forEach((model) => {
        if (model === 'loading') return;
        pipes[model] = {};
        Object.keys(this._pipes[model]).forEach((pipe) => {
          pipes[model][pipe] = false;
          pipes[model][`${pipe}Counter`] = 0;
        });
      });
      this.dispatch({
        pipes,
        type: `${config.name}/init`,
      });
    });
 
    onPipeStart$.subscribe(({ model, pipe }) => {
      this.dispatch({
        model,
        pipe,
        type: `${config.name}/pipeStart`,
        loading: 1,
      });
      this.dispatch({
        type: `${model}/loadingStart`,
        payload: { pipe },
      });
    });
  
    onPipeEnd$.subscribe(({ model, pipe }) => {
      this.dispatch({
        model,
        pipe,
        type: `${config.name}/pipeStop`,
        loading: 0,
        isEnd: true,
      });
      this.dispatch({
        type: `${model}/loadingEnd`,
        payload: { pipe },
      });
    });

    onPipeError$.subscribe(({ model, pipe }) => {
      this.dispatch({
        model,
        pipe,
        type: `${config.name}/pipeStop`,
        loading: 0,
        isError: true,
      });
      this.dispatch({
        type: `${model}/loadingEnd`,
        payload: { pipe },
      });
    });
  
    onPipeCancel$.subscribe(({ model, pipe }) => {
      this.dispatch({
        model,
        pipe,
        type: `${config.name}/pipeStop`,
        loading: 0,
        isCancel: true,
      });
      this.dispatch({
        type: `${model}/loadingEnd`,
        payload: { pipe },
      });
    });
  };
};
