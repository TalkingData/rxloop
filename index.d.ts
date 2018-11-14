import { Observable } from 'rxjs';

export interface Action {
  type: string,
  payload?: any,
  data?: any,
}

export interface OperatorsMap {
  call: Function,
  map: Function,
  dispatch: Function,
  put: Function,
  cancel$: Observable<Action>,
}

export type Reducer = (state: any, action: Action) => any;

export type Pipe = (action$: Observable<Action>, operators: OperatorsMap) => Observable<Action>;

export interface PipesMapObject {
  [key: string]: Pipe,
}

export interface ReducersMapObject {
  [key: string]: Reducer,
}

export interface Model {
  name: string,
  state?: any,
  reducers?: ReducersMapObject,
  pipes?: PipesMapObject,
}

export interface Unsubscribe {
  (): void
}

export interface RxLoopInstance {
  model: (model: Model) => void,
  stream: (modelName: String) => Observable<any>,
  dispatch: (action: Action) => void,
  subscribe: (listener: () => void) => Unsubscribe,
  getState: (modelName: String) => any,
  next: (action: Action) => void,
  start: () => void,
}

export interface Config {
  plugins?: Function[],
  onError?: Function,
}

export default function rxloop(conf?: Config): RxLoopInstance;