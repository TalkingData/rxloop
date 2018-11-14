import invariant from 'invariant';
import { filter } from 'rxjs/operators';
import { isFunction } from '../utils';
import context from './context';

// plugins
export default function init(plugins, plugin$) {
  this.plugin$ = plugin$;

  invariant(
    plugins.every(plugin => isFunction(plugin)),
    '[plugins] all plugin should be function',
  );

  plugins.push(context());
  
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
