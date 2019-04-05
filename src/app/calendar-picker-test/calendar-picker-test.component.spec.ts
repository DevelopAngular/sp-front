import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarPickerTestComponent } from './calendar-picker-test.component';

describe('CalendarPickerTestComponent', () => {
  let component: CalendarPickerTestComponent;
  let fixture: ComponentFixture<CalendarPickerTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarPickerTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarPickerTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
