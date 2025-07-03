import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
// import { NgxIonRangeSliderModule } from '@local/ngx-ion-range-slider';
import { AppComponent } from './app.component';
import { NgxIonRangeSliderModule } from 'ngx-ion-range-slider/lib/ngxionrangeslider.module';


@NgModule({
  declarations: [


  ],
  imports: [
    BrowserModule,
    AppComponent,
    FormsModule,
    NgxIonRangeSliderModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
