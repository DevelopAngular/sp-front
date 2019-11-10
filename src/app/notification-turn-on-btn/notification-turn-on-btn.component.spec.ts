import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTurnOnBtnComponent } from './notification-turn-on-btn.component';

describe('NotificationTurnOnBtnComponent', () => {
  let component: NotificationTurnOnBtnComponent;
  let fixture: ComponentFixture<NotificationTurnOnBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationTurnOnBtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationTurnOnBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
