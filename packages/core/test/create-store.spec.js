import rxloop from '..';
import { addTodo } from './helpers/actionCreators'
import * as reducers from './helpers/reducers'

function createStore(reducers, state, name = 'test') {
  const store = rxloop();
  store.model({
    name,
    state,
    reducers,
  });
  return store;
}

describe('createStore', () => {
  it('exposes the public API', () => {
    const store = createStore(reducers, [])
    const methods = Object.keys(store)

    expect(methods).toContain('subscribe')
    expect(methods).toContain('dispatch')
    expect(methods).toContain('getState')
  })

  it('passes the initial state', () => {
    const store = createStore(reducers, [
      {
        id: 1,
        text: 'Hello'
      }
    ])
    expect(store.getState('test')).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  it('applies the reducer to the previous state', () => {
    const store = createStore(reducers, [])
    expect(store.getState('test')).toEqual([])

    store.dispatch(addTodo('Hello'))
    expect(store.getState('test')).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodo('World'))
    expect(store.getState('test')).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])
  })

  it('applies the reducer to the initial state', () => {
    const store = createStore(reducers, [
      {
        id: 1,
        text: 'Hello'
      }
    ])
    expect(store.getState('test')).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodo('World'))
    expect(store.getState('test')).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])
  })

  it('supports multiple subscriptions', () => {
    const store = createStore(reducers, [])
    const listenerA = jest.fn()
    const listenerB = jest.fn()

    let unsubscribeA = store.subscribe(listenerA)  
    expect(listenerA.mock.calls.length).toBe(1)
    expect(listenerB.mock.calls.length).toBe(0)

    const unsubscribeB = store.subscribe(listenerB)
    expect(listenerA.mock.calls.length).toBe(1)
    expect(listenerB.mock.calls.length).toBe(1)

    unsubscribeA()
    unsubscribeB()
  })

  it('only removes listener once when unsubscribe is called', () => {
    const store = createStore(reducers, [])
    const listenerA = jest.fn()
    const listenerB = jest.fn()

    const unsubscribeA = store.subscribe(listenerA)
    store.subscribe(listenerB)

    unsubscribeA()
    unsubscribeA()

    store.dispatch(addTodo(''))
    expect(listenerA.mock.calls.length).toBe(1)
    expect(listenerB.mock.calls.length).toBe(2)
  })

  it('only removes relevant listener when unsubscribe is called', () => {
    const store = createStore(reducers, [])
    const listener = jest.fn()

    store.subscribe(listener)
    const unsubscribeSecond = store.subscribe(listener)
    unsubscribeSecond()

    store.dispatch(addTodo(''))
    expect(listener.mock.calls.length).toBe(3)
  })

  it('notifies only subscribers active at the moment of current dispatch', () => {
    const store = createStore(reducers, [])

    const listener1 = jest.fn()
    const listener2 = jest.fn()
    const listener3 = jest.fn()

    let listener3Added = false
    const maybeAddThirdListener = () => {
      if (!listener3Added) {
        listener3Added = true
        store.subscribe(() => listener3())
      }
    }

    store.subscribe(() => listener1())
    store.subscribe(() => {
      listener2()
      maybeAddThirdListener()
    })

    expect(listener1.mock.calls.length).toBe(1)
    expect(listener2.mock.calls.length).toBe(1)
    expect(listener3.mock.calls.length).toBe(1)

    store.dispatch(addTodo(''))
    expect(listener1.mock.calls.length).toBe(2)
    expect(listener2.mock.calls.length).toBe(2)
    expect(listener3.mock.calls.length).toBe(2)
  })

  it('uses the last snapshot of subscribers during nested dispatch', () => {
    const store = createStore(reducers, [])

    const listener1 = jest.fn()
    const listener2 = jest.fn()
    const listener3 = jest.fn()
    const listener4 = jest.fn()

    let unsubscribe4
    const unsubscribe1 = store.subscribe(() => {
      listener1()
      expect(listener1.mock.calls.length).toBe(1)
      expect(listener2.mock.calls.length).toBe(0)
      expect(listener3.mock.calls.length).toBe(0)
      expect(listener4.mock.calls.length).toBe(0)

      
      unsubscribe4 = store.subscribe(listener4)
      // store.dispatch(unknownAction())

      expect(listener1.mock.calls.length).toBe(1)
      expect(listener2.mock.calls.length).toBe(0)
      expect(listener3.mock.calls.length).toBe(0)
      expect(listener4.mock.calls.length).toBe(1)
    })
    unsubscribe1()

    store.subscribe(listener2)
    store.subscribe(listener3)

    store.dispatch(addTodo(''))
    expect(listener1.mock.calls.length).toBe(1)
    expect(listener2.mock.calls.length).toBe(2)
    expect(listener3.mock.calls.length).toBe(2)
    expect(listener4.mock.calls.length).toBe(2)

    unsubscribe4()
    store.dispatch(addTodo(''))
    expect(listener1.mock.calls.length).toBe(1)
    expect(listener2.mock.calls.length).toBe(3)
    expect(listener3.mock.calls.length).toBe(3)
    expect(listener4.mock.calls.length).toBe(2)
  })

  it('provides an up-to-date state when a subscriber is notified', done => {
    const store = createStore(reducers, [])
    store.dispatch(addTodo('Hello'))
    store.subscribe(() => {
      expect(store.getState('test')).toEqual([
        {
          id: 1,
          text: 'Hello'
        }
      ])
      done()
    })
  })

  it('only accepts plain object actions', () => {
    const store = createStore(reducers, [])
    function AwesomeMap() {}

    ;[null, undefined, 42, 'hey', new AwesomeMap()].forEach(nonObject =>
      expect(() => store.dispatch(nonObject)).toThrow(/plain/)
    )
  })

  it('handles nested dispatches gracefully', () => {
    function foo(state, action) {
      if (action.type === 'test/foo') {
        state.foo = 1;
      }
      return state
    }

    function bar(state, action) {
      if (action.type === 'test/bar') {
        state.bar = 2;
      }
      return state
    }

    const store = createStore({ foo, bar }, {
      foo: 0,
      bar: 0,
    })

    store.subscribe(function kindaComponentDidUpdate() {
      const state = store.getState('test')
      if (state.bar === 0) {
        store.dispatch({ type: 'test/bar' })
      }
    })

    store.dispatch({ type: 'test/foo' })
    expect(store.getState('test')).toEqual({
      foo: 1,
      bar: 2
    })
  })

  it('throws if action type is missing', () => {
    const store = createStore(reducers, [])
    expect(() => store.dispatch({})).toThrow(
      "[action] action should be a plain Object with type"
    )
  })

  it('throws if action type is undefined', () => {
    const store = createStore(reducers, [])
    expect(() => store.dispatch({ type: undefined })).toThrow(
      "[action] action should be a plain Object with type"
    )
  })

  it('throws if listener is not a function', () => {
    const store = createStore(reducers, [])

    expect(() => store.subscribe()).toThrow()
    expect(() => store.subscribe('')).toThrow()
    expect(() => store.subscribe(null)).toThrow()
    expect(() => store.subscribe(undefined)).toThrow()
  })
})
