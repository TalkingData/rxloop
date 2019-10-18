import { Observable } from 'rxjs';

export interface API {
  onModel$: Observable<any>,
  onEpicStart$: Observable<any>,
  onEpicEnd$: Observable<any>,
  onEpicCancel$: Observable<any>,
  onEpicError$: Observable<any>,
  onStart$: Observable<any>,
}

export type Plugin = (api: API) => void;

export interface Config {
  blacklist?: String[],
}

export default function rxloopDevtools(conf?: Config): Plugin;
