import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxIonRangeSliderModule } from '@local/ngx-ion-range-slider';
import { AppComponent } from './app.component';
import { CustomizeComponent } from './customize/customize.component';


@NgModule({
  declarations: [
    AppComponent,
    CustomizeComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxIonRangeSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
