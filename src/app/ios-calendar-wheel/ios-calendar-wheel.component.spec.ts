import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosCalendarWheelComponent } from './ios-calendar-wheel.component';

describe('IosCalendarWheelComponent', () => {
  let component: IosCalendarWheelComponent;
  let fixture: ComponentFixture<IosCalendarWheelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosCalendarWheelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosCalendarWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
