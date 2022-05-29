import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ionrangesliderangular';

  arrayNumers: number[] =[];
  arrayChars : string[] = [];

  min: number = 0;
  max: number = 100;
  constructor(){
    for(let i=0;i<=21;i++){
      this.arrayNumers.push(i);
      this.arrayChars.push( String.fromCharCode(97 + i));
    }
  }


  onChange($event: number | { min: number; max: number }) {
    if (typeof $event === 'number') {
      this.min = $event;
    } else {
      this.min = $event.min;
      this.max = $event.max;
    }
  }
}
