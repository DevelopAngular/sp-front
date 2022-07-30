import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationOptionComponent } from './notification-option.component';

describe('NotificationOptionComponent', () => {
  let component: NotificationOptionComponent;
  let fixture: ComponentFixture<NotificationOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
