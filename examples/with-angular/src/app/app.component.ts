import { Component } from '@angular/core';
import rxloop from '../../../../';

const app = rxloop();

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
});

app.stream('test').subscribe((v) => {
  console.log(v);
});

app.dispatch({
  type: 'test/add',
});


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
}
