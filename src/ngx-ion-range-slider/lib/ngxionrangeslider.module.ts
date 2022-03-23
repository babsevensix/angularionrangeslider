import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxIonRangeSliderComponent } from './ngx-ion-range-slider.component';
// import { SliderElementDirective } from './slider-element.directive';
// import { SliderHandleDirective } from './slider-handle.directive';
// import { SliderLabelDirective } from './slider-label.directive';
// import { TooltipWrapperComponent } from './tooltip-wrapper.component';

/**
 * NgxSlider module
 *
 * The module exports the slider component
 */
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    NgxIonRangeSliderComponent,
    // SliderElementDirective,
    // SliderHandleDirective,
    // SliderLabelDirective,
    // TooltipWrapperComponent
  ],
  exports: [
    NgxIonRangeSliderComponent
  ]
})
export class NgxIonRangeSliderModule { }
