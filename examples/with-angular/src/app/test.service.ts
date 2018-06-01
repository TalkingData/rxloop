import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Component } from '@angular/core';
import rxloop from '@rxloop/core';

const app = rxloop();

const api = async () => {
  throw new Error('Http Error');
  // return {
  //   code: 200,
  //   data: {},
  // };
};

app.model({
  name: 'test',
  state: {
    counter: 0,
  },
  reducers: {
    add(state) {
      return {
        ...state,
        counter: state.counter + 1,
      };
    },
  },
  epics: {
    getData(action$) {
      return action$.pipe(
        switchMap(() => {
          return from(api());
        }),
        map((v) => {
          console.log(v);
          return {
            type: 'add',
          };
        }),
      );
    }
  }
});

const test = app.stream('test');
test.subscribe(
  (v) => {
    console.log(v);
  },
  (err) => {
    console.log(err);
    console.log(test);
  },
  () => {
    console.log('com');
  },
);


@Injectable({
  providedIn: 'root',
})
export class HeroService {
  constructor() {
    app.dispatch({
      type: 'test/getData',
    });

    setInterval(() => {
      console.log(1);
      app.dispatch({
        type: 'test/getData',
      });
      console.log(2);
    }, 1000);
  }

  getHeroes(): Observable<any> {
    return app.stream('test');
  }
}
