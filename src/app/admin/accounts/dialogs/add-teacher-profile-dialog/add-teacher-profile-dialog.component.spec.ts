import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeacherProfileDialogComponent } from './add-teacher-profile-dialog.component';

describe('AddTeacherProfileDialogComponent', () => {
  let component: AddTeacherProfileDialogComponent;
  let fixture: ComponentFixture<AddTeacherProfileDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTeacherProfileDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTeacherProfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
