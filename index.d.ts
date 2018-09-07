import { Observable } from 'rxjs';

export interface Action {
  type: string,
  payload?: any,
  data?: any,
}

export type Reducer = (state: any, action: Action) => any;

export type Epic = (action$: Observable<Action>, cancel$: Observable<Action>) => Observable<Action>;

export interface EpicsMapObject {
  [key: string]: Epic,
}

export interface ReducersMapObject {
  [key: string]: Reducer,
}

export interface Model {
  name: string,
  state?: any,
  reducers?: ReducersMapObject,
  epics?: EpicsMapObject,
}

export interface RxLoopInstance {
  model: (model: Model) => void,
  stream: (modelName: String) => Observable<any>,
  dispatch: (action: Action) => void,
  getState: (modelName: String) => any,
  next: (action: Action) => void,
}

export interface Config {
  plugins?: Function[],
  onError?: Function,
}

export default function rxloop(conf?: Config): RxLoopInstance;