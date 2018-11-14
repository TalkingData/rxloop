export default function context() {
  return function init({
    onModelBeforeCreate$,
    onStatePatch$,
    onEpicStart$,
    onEpicEnd$,
    onEpicError$,
    onEpicCancel$,
   }) {
    if ( this.context !== void 0 ) return;

    this.context = {};
    this.getMeta = getContext;
    this.getContext = getContext;
    
    function getContext(model) {
      return model !== void 0 ? this.context[model] : this.context;
    }

    onModelBeforeCreate$.subscribe(({ model }) => {
      const context = {
        source: '',
      };

      if ( model.epics ) {
        context.epic = {};
        Object.keys(model.epics).forEach(epic => {
          context.epic[epic] = 'pending';
        });
      }

      this.context[model.name] = context;
    });

    onStatePatch$.subscribe(({ model, reducerAction }) => {
      const context = this.context[model];
      if (context) {
        context.source = reducerAction.__source__.reducer || reducerAction.__source__.epic;
      }
    });
    
    onEpicStart$.subscribe(({ model, epic }) => {
      const context = this.context[model];
      context.source = '';
      context.epic[epic] = 'start';
    });
    
    onEpicEnd$.subscribe(({ model, epic }) => {
      const context = this.context[model];
      context.epic[epic] = 'success';
    });

    onEpicError$.subscribe(({ model, epic }) => {
      const context = this.context[model];
      context.source = epic;
      context.epic[epic] = 'error';
    });

    onEpicCancel$.subscribe(({ model, epic }) => {
      const context = this.context[model];
      context.source = epic;
      context.epic[epic] = 'cancel';
    });
  };
};
