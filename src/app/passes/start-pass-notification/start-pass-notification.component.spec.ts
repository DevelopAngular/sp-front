import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StartPassNotificationComponent} from './start-pass-notification.component';

describe('StartPassNotificationComponent', () => {
  let component: StartPassNotificationComponent;
  let fixture: ComponentFixture<StartPassNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartPassNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartPassNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
