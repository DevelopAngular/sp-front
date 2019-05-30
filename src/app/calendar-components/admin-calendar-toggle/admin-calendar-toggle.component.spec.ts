import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCalendarToggleComponent } from './admin-calendar-toggle.component';

describe('AdminCalendarToggleComponent', () => {
  let component: AdminCalendarToggleComponent;
  let fixture: ComponentFixture<AdminCalendarToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCalendarToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCalendarToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
