import { Observable } from 'rxjs';

export interface Config {
  name?: string,
}

export interface API {
  onModel$: Observable<any>,
  onPipeStart$: Observable<any>,
  onPipeEnd$: Observable<any>,
  onPipeCancel$: Observable<any>,
  onPipeError$: Observable<any>,
}

export type Plugin = (api: API) => void;

export default function loading(opts?: Config): Plugin;
