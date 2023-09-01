import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxIonRangeSliderComponent } from './ngx-ion-range-slider.component';

/**
 * NgxSlider module
 *
 * The module exports the slider component
 */
@NgModule({
  imports: [
    CommonModule,
    NgxIonRangeSliderComponent,
  ],
  declarations: [

  ],
  exports: [
    NgxIonRangeSliderComponent
  ]
})
export class NgxIonRangeSliderModule { }
