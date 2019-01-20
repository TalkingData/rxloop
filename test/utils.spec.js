import rxloop from "../src/";
import { map, skip, withLatestFrom, tap } from "rxjs/operators";
import { model, reducer, pipe, AllModel } from "../src/utils";

@model({ name: "", email: "" })
class User {
  @reducer
  changeName(state, action) {
    return { ...state, name: action.payload };
  }

  @pipe
  getData(action$, { call }) {
    return action$.pipe(
      call(async action => {
        return "wxnet";
      }),
      map(payload => {
        return { type: "changeName", payload };
      })
    );
  }
}
const userByPlainObj = {
  name: "user",
  state: { name: "", email: "" },
  reducers: {
    changeName(state, action) {
      return { ...state, name: action.payload };
    }
  },
  pipes: {
    getData(action$, { call }) {
      return action$.pipe(
        call(async action => {
          return "wxnet";
        }),
        map(payload => {
          return { type: "changeName", payload };
        })
      );
    }
  }
};

const userByClass = User;

let appObj = null;
let appClass = null;

const usage = app => {
  app.dispatch({
    type: "user/changeName",
    payload: "test"
  });
  app.dispatch({
    type: "user/getData"
  });
};

describe("all decorator is work", () => {
  beforeEach(() => {
    appObj = rxloop();
    appObj.model(userByPlainObj);
    appClass = rxloop();
    appClass.model(userByClass);
  });

  test("the defintion is same", () => {
    expect(JSON.stringify(userByClass[AllModel]())).toEqual(JSON.stringify(userByPlainObj));
  });

  test("init state is same", () => {
    expect(appObj.getState("user")).toEqual(appClass.getState("user"));
  });

  test("state is same after basic action", done => {
    appObj.user$
      .pipe(
        withLatestFrom(appClass.user$),
        tap(([stateObj, stateClass]) => {
          expect(stateObj).toEqual(stateClass);
        }),
        skip(2)
      )
      .subscribe(([stateObj]) => {
        expect(stateObj.name).toEqual("wxnet");
        done();
      });

    usage(appClass);
    usage(appObj);
  });
});
