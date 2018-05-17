import { Component } from '@angular/core';
import { HeroService } from './test.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(public test: HeroService) {
    test.getHeroes().subscribe((v) => {
      console.log(v);
    });
  }
}
