import { TestBed } from '@angular/core/testing';

import { NgxIonRangeSliderService } from './ngx-ion-range-slider.service';

describe('NgxIonRangeSliderService', () => {
  let service: NgxIonRangeSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxIonRangeSliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
