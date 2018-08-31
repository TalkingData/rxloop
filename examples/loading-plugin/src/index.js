import { from } from 'rxjs';
import { mergeMap, map, takeUntil } from 'rxjs/operators';
import rxloop from '@rxloop/core';
import loading from '@rxloop/loading';

const apiSlow = async () => {
  const data = await new Promise((resolve) => {
    setTimeout(() => resolve({}), 2000);
  });
  return { code: 200, data };
};

const counter = {
  name: 'counter',
  state: {
    counter: 0,
  },
  reducers: {
    increment(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
    decrement(state) {
      return {
        ...state,
        counter: state.counter + 1
      };
    },
  },
  epics: {
    setData(action$){
      return action$.pipe(
        map(() => {
          return {
            type: 'increment',
          };
        }),
      );
    },
    getData(action$) {
      return action$.pipe(
        mergeMap(() => {
          return from( apiSlow() );
        }),
        map((data) => {
          return {
            data,
            type: 'increment',
          };
        }),
      );
    }
  }
};

const app = rxloop({
  plugins: [ loading() ],
});
app.model(counter);

app.stream('counter').subscribe(state => {
  document.getElementById('counter').innerHTML = state.counter;
});

// loading 状态
app.stream('loading').subscribe(state => {
  // 某个 epic 的 loading 状态
  console.log(state.epics.counter);
  document.getElementById('counter').innerHTML = state.epics.counter.getData ? `
  <svg width="28" height="28" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#3498DB">
    <g fill="none" fill-rule="evenodd">
        <g transform="translate(1 1)" stroke-width="2">
            <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
            <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 18 18"
                    to="360 18 18"
                    dur="1s"
                    repeatCount="indefinite"/>
            </path>
        </g>
    </g>
</svg>
`:
'';

  // TODO： 某个 model 的 loading 状态，支持获取异步个数
  // state.counter

  // TODO： 整个应用的 loading 状态，支持获取异步个数
  // state.global
});


document.getElementById('getdata').onclick = () => {
  app.dispatch({
    type: 'counter/getData',
  });
};
