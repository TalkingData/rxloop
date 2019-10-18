// import rxloop from '../../src/';
// import { from } from 'rxjs';
// import { mapTo, map, takeUntil, switchMap } from "rxjs/operators";

// describe('Error check', () => {
//   test('Throw error if all plugin should not be function', () => {
//     expect(() => {
//       rxloop({
//         plugins: [
//           function plugin() {},
//           'plugin',
//         ],
//       });
//     }).toThrow('[plugins] all plugin should be function');
//   });

//   test('Should not throw error', () => {
//     expect(() => {
//       rxloop({
//         plugins: [
//           function pluginOne() {},
//           function pluginTwo() {},
//         ],
//       });
//     }).not.toThrow('[plugins] all plugin should be function');
//   });
// });

// describe('Basic api', () => {
//   test('plugin event source', () => {
//     rxloop({
//       plugins: [
//         function pluginOne({
//           onModelBeforeCreate$,
//           onModelCreated$,
//           onPipeStart$,
//           onPipeEnd$,
//           onPipeCancel$,
//           onPipeError$,
//         }) {
//           expect(onModelBeforeCreate$).not.toBeUndefined();
//           expect(onModelCreated$).not.toBeUndefined();
//           expect(onPipeStart$).not.toBeUndefined();
//           expect(onPipeEnd$).not.toBeUndefined();
//           expect(onPipeCancel$).not.toBeUndefined();
//           expect(onPipeError$).not.toBeUndefined();
//         },
//         function pluginTwo({
//           onModelBeforeCreate$,
//           onModelCreated$,
//           onPipeStart$,
//           onPipeEnd$,
//           onPipeCancel$,
//           onPipeError$,
//         }) {
//           expect(onModelBeforeCreate$).not.toBeUndefined();
//           expect(onModelCreated$).not.toBeUndefined();
//           expect(onPipeStart$).not.toBeUndefined();
//           expect(onPipeEnd$).not.toBeUndefined();
//           expect(onPipeCancel$).not.toBeUndefined();
//           expect(onPipeError$).not.toBeUndefined();
//         },
//       ],
//     });
//   });

//   test('Event onModel will be dispached', (done) => {
//     const app = rxloop({
//       plugins: [
//         function pluginOne({ onModelCreated$ }) {
//           onModelCreated$.subscribe((data) => {
//             expect(data).toEqual({
//               type: 'plugin',
//               action: 'onModelCreated',
//               model: 'test'
//             });
//             done();
//           });
//         },
//       ],
//     });
//     app.model({ name: 'test', state: {} });
//   });

//   test('Event onPipeStart will be dispached', (done) => {
//     const app = rxloop({
//       plugins: [
//         function pluginOne({ onPipeStart$ }) {
//           onPipeStart$.subscribe((data) => {
//             delete data.data.__cancel__;
//             delete data.data.__bus__;

//             expect(data).toEqual({
//               type: 'plugin',
//               action: "onPipeStart",
//               model: 'test',
//               pipe: "getData",
//               data: {
//                 type: "test/getData",
//               },
//             });
//             done();
//           });
//         },
//       ],
//     });

//     app.model({
//       name: 'test',
//       state: {},
//       reducers: {
//         add(state) { return state },
//       },
//       pipes: {
//         getData(action$) {
//           return action$.pipe(
//             mapTo({
//               type: 'add',
//             }),
//           );
//         },
//       },
//     });
//     app.dispatch({
//       type: 'test/getData',
//     });
//   });

//   test('Event onPipeEnd will be dispached', (done) => {
//     const app = rxloop({
//       plugins: [
//         function pluginOne({ onPipeEnd$ }) {
//           onPipeEnd$.subscribe((data) => {
//             expect(data).toEqual({
//               data: {
//                 type: 'add',
//                 payload: 1,
//               },
//               type: 'plugin',
//               action: "onPipeEnd",
//               model: 'test',
//               pipe: "getData",
//             });
//             done();
//           });
//         },
//       ],
//     });

//     app.model({
//       name: 'test',
//       state: {},
//       reducers: {
//         add(state) { return state },
//       },
//       pipes: {
//         getData(action$) {
//           return action$.pipe(
//             mapTo({
//               type: 'add',
//               payload: 1,
//             }),
//           );
//         },
//       },
//     });
//     app.dispatch({
//       type: 'test/getData',
//     });
//   });

//   test('Event onPipeCancel will be dispached', (done) => {
//     const apiSlow = async () => {
//       const data = await new Promise((resolve) => {
//         setTimeout(() => resolve({}), 5000);
//       });
//       return { code: 200, data };
//     };

//     const app = rxloop({
//       plugins: [
//         function pluginOne({ onPipeCancel$ }) {
//           onPipeCancel$.subscribe((data) => {
//             expect(data).toEqual({
//               type: 'plugin',
//               action: "onPipeCancel",
//               model: 'test',
//               pipe: "getSlowlyData",
//             });
//             done();
//           });
//         },
//       ],
//     });

//     app.model({
//       name: 'test',
//       state: {},
//       reducers: {
//         add(state) {
//           return {
//             ...state,
//             a: 1,
//           };
//         },
//       },
//       pipes: {
//         getSlowlyData(action$, cancel$) {
//           return action$.pipe(
//             switchMap(() => {
//               return from(apiSlow).pipe( takeUntil(cancel$) );
//             }),
//             mapTo({
//               type: 'add',
//             }),
//           );
//         },
//       },
//     });
//     app.dispatch({
//       type: 'test/getSlowlyData',
//     });
//     app.dispatch({
//       type: 'test/getSlowlyData/cancel',
//     });
//   });

//   test('Event onPipeError will be dispached', (done) => {
//     const app = rxloop({
//       plugins: [
//         function pluginOne({ onPipeError$ }) {
//           onPipeError$.subscribe((data) => {
//             expect(data).toEqual({
//               error: 'pipe error',
//               type: 'plugin',
//               action: "onPipeError",
//               model: 'test',
//               pipe: "getErrorData",
//             });
//             done();
//           });
//         },
//       ],
//     });

//     app.model({
//       name: 'test',
//       state: {},
//       reducers: {
//         add(state) {
//           return {
//             ...state,
//             a: 1,
//           };
//         },
//       },
//       pipes: {
//         getErrorData(action$) {
//           return action$.pipe(
//             map(() => {
//               throw 'pipe error';
//               // return {
//               //   type: 'add',
//               // };
//             }),
//           );
//         },
//       },
//     });
//     app.dispatch({
//       type: 'test/getErrorData',
//     });
//   });

//   const mockfn = jest.fn();
//   const app = rxloop({
//     plugins: [
//       function pluginOne({ onStatePatch$ }) {
//         onStatePatch$.subscribe(mockfn);
//       },
//     ],
//   });

//   app.model({
//     name: 'counter',
//     state: {
//       counter: 0,
//     },
//     reducers: {
//       inc(state) {
//         return {
//           counter: state.counter + 1,
//         };
//       },
//       dec(state) {
//         return {
//           counter: state.counter - 1,
//         };
//       },
//     },
//   });
//   app.start();
//   app.stream('counter').subscribe();

//   app.dispatch({
//     type: 'counter/inc',
//   });
//   app.dispatch({
//     type: 'counter/inc',
//   });
//   app.dispatch({
//     type: 'counter/dec',
//   });
  
//   test('Event onStatePatch will be dispached', () => {
//     expect(mockfn.mock.calls.length).toBe(3);
//     expect(mockfn.mock.calls[0][0]).toEqual({
//       state: { counter: 1 },
//       reducerAction: { type: 'counter/inc', __source__: { reducer: 'inc' } },
//       model: 'counter',
//       type: 'plugin',
//       action: 'onStatePatch',
//     });
//     expect(mockfn.mock.calls[1][0]).toEqual({
//       state: { counter: 2 },
//       reducerAction: { type: 'counter/inc', __source__: { reducer: 'inc' } },
//       model: 'counter',
//       type: 'plugin',
//       action: 'onStatePatch',
//     });
//     expect(mockfn.mock.calls[2][0]).toEqual({
//       state: { counter: 1 },
//       reducerAction: { type: 'counter/dec', __source__: { reducer: 'dec' } },
//       model: 'counter',
//       type: 'plugin',
//       action: 'onStatePatch',
//     });
//   });

// });