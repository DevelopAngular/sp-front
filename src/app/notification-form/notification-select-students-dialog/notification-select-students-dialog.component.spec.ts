import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSelectStudentsDialogComponent } from './notification-select-students-dialog.component';

describe('NotificationSelectStudentsDialogComponent', () => {
  let component: NotificationSelectStudentsDialogComponent;
  let fixture: ComponentFixture<NotificationSelectStudentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationSelectStudentsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSelectStudentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
