import { Observable } from 'rxjs';
export { Observable, Subject } from 'rxjs';

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

export type Reducer<T=any> = (state: T, action?: Action) => T;

export type Pipe = (action$: Observable<Action>, operators?: OperatorsMap) => Observable<Action>;

type MapObject<T>={
  [key: string]: T,
}

export type Model<T=any> = {
  name: string,
  state: T,
  reducers?: MapObject<Reducer>,
  pipes?: MapObject<Pipe>,
}

interface NumberFunction extends Function {
  (n:number):number;
}

type Class = { new(): any; };

// decorator
export function decorators<T=any>():{
  model(state: T): (Target: Class) => Class
 
  reducer(target: any, name: string, descriptor: TypedPropertyDescriptor<Reducer<T>>) : void
 
  pipe(target: any, name: string, descriptor: TypedPropertyDescriptor<Pipe>) : void 
 
}
 


export interface Unsubscribe {
  (): void
}

export interface RxLoopInstance {
  model: (model: Model | Class) => void,
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