import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosCalendarComponent } from './ios-calendar.component';

describe('IosCalendarComponent', () => {
  let component: IosCalendarComponent;
  let fixture: ComponentFixture<IosCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
