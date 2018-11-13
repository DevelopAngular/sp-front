import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallDateTimePickerComponent } from './hall-date-time-picker.component';

describe('HallDateTimePickerComponent', () => {
  let component: HallDateTimePickerComponent;
  let fixture: ComponentFixture<HallDateTimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallDateTimePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallDateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
