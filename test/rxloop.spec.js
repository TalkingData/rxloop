import rxloop from '../src/';
import { of } from 'rxjs';
import { map, mapTo } from "rxjs/operators";

const app = rxloop();
app.model({
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state,) {
      return {
        ...state,
        counter: state.counter + 1,
      };
    },
    decrement(state,) {
      return {
        ...state,
        counter: state.counter - 1,
      };
    },
    setCounter(state, action) {
      return {
        ...state,
        counter: action.counter,
      };
    }
  },
  epics: {
    getRemoteCount(action$) {
      return action$.pipe(
        mapTo({
          type: 'setCounter',
          counter: 100,
        }),
      );
    },
    isNotAction(action$) {
      return action$.pipe(
        mapTo({
          counter: 100,
        }),
      );
    }
  }
});

app.model({
  name: 'comment',
  state: {
    list: [],
  },
});

app.model({
  name: 'a',
  state: {
    txt: 'a',
  },
  reducers: {
    update(state, action) {
      return {
        ...state,
        ...action.data,
      };
    },
  },
  epics: {
    setTxt(action$) {
      return action$
      .pipe(
        map(() => {
          this.dispatch({
            type: 'b/update',
            data: { txt: 'updated from a' },
          });
          return {
            type: 'update',
            data: { txt: 'updated' },
          };
        }),
      );
    }
  },
});

app.model({
  name: 'b',
  state: {
    txt: 'b',
  },
  reducers: {
    update(state, action) {
      return {
        ...state,
        ...action.data,
      };
    }
  }
});

describe('Basic api', () => {
  test('exposes the public API', () => {
    const apis = Object.keys(app);

    expect(apis).toContain('model');
    expect(apis).toContain('counter$');
    expect(apis).toContain('comment$');
    expect(apis).toContain('dispatch');
    expect(apis).toContain('getState');
    expect(apis).toContain('stream');
    expect(apis).toContain('plugin$');
  });

  test('default counter state is { counter: 0 }', () => {
    expect(app.getState('counter')).toEqual({
      counter: 0,
    });
  });

  test('default comment state is { list: [] }', () => {
    expect(app.getState('comment')).toEqual({
      list: [],
    });
  });

});

describe('Error check', () => {
  test('throws if is pass an existed name', () => {
    expect(() => app.model({ name: 'counter' })).toThrow()
  });

  test('throws if is duplicated type in epics and reducers', () => {
    expect(() => {
      app.model({
        name: 'test',
        state: {},
        reducers: {
          aa(state) {
            return state;
          },
        },
        epics: {
          aa(action$) {
            return action$.pipe(
              mapTo({})
            );
          },
        },
      });
    }).toThrow()
  });

  test('throws if reducers is not a plain object', () => {
    expect(() => app.model({ name: 'c', state: 1, reducers: 'object' }))
    .toThrow('[app.model] reducers should be plain object, but got string');
  });

  test('throws if all reducer should not be function', () => {
    expect(() => app.model({
      name: 'd',
      state: 1,
      reducers: {
        a() {},
        b: 'b',
      },
    }))
    .toThrow('[app.model] all reducer should be function');
  });

  test('throws if epics is not a plain object', () => {
    expect(() => app.model({ name: 'c', state: 1, epics: 'object' }))
    .toThrow('[app.model] epics should be plain object, but got string');
  });

  test('throws if all epic should not be function', () => {
    expect(() => app.model({
      name: 'e',
      state: 1,
      epics: {
        a() {},
        b: 'b',
      },
    }))
    .toThrow('[app.model] all epic should be function');
  });

  test('throws if is not pass an undifined model', () => {
    expect(() => app.stream('undifined')).toThrow();
  });

  test('throws if is not pass a plain object with type', () => {
    expect(() => app.dispatch({})).toThrow();
  });
});

describe('Basic usage', () => {
  test('dispatch increment: state is { counter: 4 }', () => {
    app.dispatch({
      type: 'counter/increment',
    });
    app.dispatch({
      type: 'counter/increment',
    });
    app.dispatch({
      type: 'counter/increment',
    });
    of(1).pipe(
      mapTo({
        type: 'counter/increment',
      }),
    ).subscribe(app);
    expect(app.getState('counter')).toEqual({
      counter: 4,
    });
  });

  test('dispatch decrement: state is { counter: 2 }', () => {
    app.dispatch({
      type: 'counter/decrement',
    });
    app.dispatch({
      type: 'counter/decrement',
    });
    expect(app.getState('counter')).toEqual({
      counter: 2,
    });
    let _value;
    app.stream('counter').subscribe(value => (_value = value));
    expect(_value).toEqual({
      counter: 2,
    });
  });

  test('dispatch getRemoteCount: state is { counter: 100 }', () => {
    app.dispatch({
      type: 'counter/getRemoteCount',
    });
    expect(app.getState('counter')).toEqual({
      counter: 100,
    });
  });
});

describe('Cross model usage', () => {
  test('dispatch model A: update model B', () => {
    app.dispatch({
      type: 'a/setTxt',
    });
    expect(app.getState('a')).toEqual({
      txt: 'updated',
    });
    expect(app.getState('b')).toEqual({
      txt: 'updated from a',
    });
  });
});

describe('check config', () => {
  test('Mount a plugin', () => {
    const mockPlugin = jest.fn();
    rxloop({
      plugins: [
        mockPlugin,
      ],
    });
    expect(mockPlugin.mock.calls.length).toBe(1);
    const pluginEvts = Object.keys(mockPlugin.mock.calls[0][0]);
    expect(pluginEvts.length).toBe(8);
    expect(pluginEvts).toContain('onModelBeforeCreate$');
    expect(pluginEvts).toContain('onModelCreated$');
    expect(pluginEvts).toContain('onEpicStart$');
    expect(pluginEvts).toContain('onEpicEnd$');
    expect(pluginEvts).toContain('onEpicCancel$');
    expect(pluginEvts).toContain('onEpicError$');
    expect(pluginEvts).toContain('onStatePatch$');
    expect(pluginEvts).toContain('onStart$');
  });
  test('global error hook', (done) => {
    const app = rxloop({
      onError(json) {
        expect(json).toEqual({
          error: 'boom!',
          model: 'test',
          epic: 'getData',
        });
        done();
      },
    });

    app.model({
      name: 'test',
      state: {},
      reducers: {
        add(state) {
          return state;
        },
      },
      epics: {
        getData(action$) {
          return action$.pipe(
            map(() => {
              throw 'boom!';
            }),
          );
        },
      },
    });
    app.dispatch({ type: 'test/getData' });
  });
});

describe('Single store', () => {
  const app = rxloop();
  app.model({
    name: 'user',
    state: {
      user: 'user', 
    },
  });
  app.model({
    name: 'counter',
    state: {
      counter: 0, 
    },
    reducers: {
      inc(state) {
        return {
          counter: state.counter + 1,
        };
      }
    },
  });
  app.dispatch({ type: 'counter/inc' });

  test('single stream test', (done) => {
    app.stream().subscribe(store => {
      expect(store).toEqual({
        user: {
          user: 'user',
        },
        counter: {
          counter: 1,
        },
      });
      done();
    });
  });

  test('Subscribe single stream', (done) => {
    const sub = app.subscribe(() => {
      expect(app.getState()).toEqual({
        user: {
          user: 'user',
        },
        counter: {
          counter: 1,
        },
      });
      done();
    });
    sub.unsubscribe();
  });

  test('get single store test', () => {
    expect(app.getState('user')).toEqual({
      user: 'user',
    });
    expect(app.getState('counter')).toEqual({
      counter: 1,
    });
    expect(app.getState()).toEqual({
      user: {
        user: 'user',
      },
      counter: {
        counter: 1,
      },
    });
  });
});
