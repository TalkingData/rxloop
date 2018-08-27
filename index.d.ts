import { Observable } from 'rxjs';

export interface Action {
  type: string,
  payload?: any,
  data?: any,
}

export type Reducer = (state: any, action: Action) => any;

export type Epic = (action$: Observable<any>, cancel$: Observable<any>) => Observable<any>;

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
  plugins?: Array<function>,
}

export default function rxloop(conf?: Config): RxLoopInstance;