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
  constructor(){
    for(let i=0;i<=21;i++){
      this.arrayNumers.push(i);
      this.arrayChars.push( String.fromCharCode(97 + i));
    }
  }
}
