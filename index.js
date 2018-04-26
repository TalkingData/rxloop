import { of } from 'rxjs';

export default function init() {

  function model({ name, state, reducers, epics }) {
    this._reducers = { ...this._reducers, [`${name}Reducers`]: reducers};
    this._epics = { ...this._epics, epics };

    return of(state);
  }

  function dispatch(action) {
    // sync
    if (this._reducers[action.type]) {
      this._reducers[action.type](this.state);
    }
    // async
    // if (this._epics[action.type]) {
    //   this._epics[action.type](this.state);
    // }
  }

  const app = {
    _models: {},
    _reducers: {},
    _epics: {},
    model,
    dispatch,
  };
  return app;
};
