import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { IonRangeSliderComponent } from './ion-range-slider/ion-range-slider.component';


@NgModule({
  declarations: [
    AppComponent,
    IonRangeSliderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
