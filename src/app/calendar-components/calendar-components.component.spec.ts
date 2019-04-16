import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponentsComponent } from './calendar-components.component';

describe('CalendarComponentsComponent', () => {
  let component: CalendarComponentsComponent;
  let fixture: ComponentFixture<CalendarComponentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarComponentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
