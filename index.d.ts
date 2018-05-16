import { Observable } from 'rxjs';

export interface Model {
  name: string,
  state?: any,
  reducers?: any,
  epics?: any,
}

export interface Action {
  type: string,
  payload?: any,
  data?: any,
}

export interface RxLoopInstance {
  model: (model: Model) => void,
  stream: (modelName: String) => Observable<any>,
  dispatch: (action: Action) => void,
}

export default function rxloop(): RxLoopInstance;