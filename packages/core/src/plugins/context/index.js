export default function context() {
  return function init({
    onModelBeforeCreate$,
    onStatePatch$,
    onPipeStart$,
    onPipeEnd$,
    onPipeError$,
    onPipeCancel$,
   }) {
    this.context = {};
    
    onModelBeforeCreate$.subscribe(({ model }) => {
      const context = {
        source: '',
      };

      if ( model.pipes ) {
        context.pipe = {};
        Object.keys(model.pipes).forEach(pipe => {
          context.pipe[pipe] = 'pending';
        });
      }

      this.context[model.name] = context;
    });

    onStatePatch$.subscribe(({ model, reducerAction }) => {
      const context = this.context[model];
      if (context) {
        context.source = reducerAction.__source__.reducer || reducerAction.__source__.pipe;
      }
    });
    
    onPipeStart$.subscribe(({ model, pipe }) => {
      const context = this.context[model];
      context.source = '';
      context.pipe[pipe] = 'start';
    });
    
    onPipeEnd$.subscribe(({ model, pipe }) => {
      const context = this.context[model];
      context.pipe[pipe] = 'success';
    });

    onPipeError$.subscribe(({ model, pipe }) => {
      const context = this.context[model];
      context.source = pipe;
      context.pipe[pipe] = 'error';
    });

    onPipeCancel$.subscribe(({ model, pipe }) => {
      const context = this.context[model];
      context.source = pipe;
      context.pipe[pipe] = 'cancel';
    });
  };
};
