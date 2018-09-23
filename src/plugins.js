import { filter } from 'rxjs/operators';

// plugins
export default function init(plugins, plugin$) {
  this.plugin$ = plugin$;
  
  const source = evt => this.plugin$.pipe( filter(e => e.action === evt) );

  plugins.forEach(plugin => plugin.call(this, {
    onModelBeforeCreate$: source('onModelBeforeCreate'),
    onModelCreated$: source('onModelCreated'),
    onEpicStart$: source('onEpicStart'),
    onEpicEnd$: source('onEpicEnd'),
    onEpicCancel$: source('onEpicCancel'),
    onEpicError$: source('onEpicError'),
    onStatePatch$: source('onStatePatch'),
    onStart$: source('onStart'),
  }));
};
