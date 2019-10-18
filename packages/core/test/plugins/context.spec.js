// import rxloop from '../../src';
// import { mapTo, tap, delay } from "rxjs/operators";

// describe('Pipe success', () => {
//   const store = rxloop();

//   store.model({
//     name: 'user',
//     state: {
//       name: 'wxnet',
//     },
//     reducers: {
//       info(state){
//         return state;
//       }
//     },
//     pipes: {
//       a(action$) {
//         return action$.pipe(
//           mapTo({ type: 'info' }),
//         );
//       },
//       b(action$) {
//         return action$.pipe(
//           delay(300),
//           mapTo({ type: 'info' }),
//         );
//       },
//       c(action$) {
//         return action$.pipe(
//           tap(() => {
//             throw 'error';
//           }),
//           mapTo({ type: 'info' }),
//         );
//       },
//     },
//   });

//   test('Default state', () => {
//     expect(store.context.user).toEqual({
//       source: '',
//       pipe: {
//         a: 'pending',
//         b: 'pending',
//         c: 'pending',
//       }
//     });
//   });

//   test('The a pipe status is success', (done) => {
//     store.dispatch({
//       type: 'user/a',
//     });
//     store.stream('user').subscribe(() => {
//       expect(store.context.user).toEqual({
//         source: 'a',
//         pipe: {
//           a: 'success',
//           b: 'pending',
//           c: 'pending',
//         }
//       });
//       done();
//     });
//   });

//   test('The b pipe status is canceled', () => {
//     store.dispatch({
//       type: 'user/b/cancel',
//     });
//     expect(store.context.user).toEqual({
//       source: 'b',
//       pipe: {
//         a: 'success',
//         b: 'cancel',
//         c: 'pending',
//       }
//     });
//   });

//   test('The c pipe status is error', () => {
//     store.dispatch({
//       type: 'user/c',
//     });
//     expect(store.context.user).toEqual({
//       source: 'c',
//       pipe: {
//         a: 'success',
//         b: 'cancel',
//         c: 'error',
//       }
//     }); 
//   });
// });
