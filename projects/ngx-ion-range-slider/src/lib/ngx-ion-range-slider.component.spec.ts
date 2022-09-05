import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxIonRangeSliderComponent } from './ngx-ion-range-slider.component';

describe('NgxIonRangeSliderComponent', () => {
  let component: NgxIonRangeSliderComponent;
  let fixture: ComponentFixture<NgxIonRangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxIonRangeSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxIonRangeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
