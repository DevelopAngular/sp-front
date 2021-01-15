import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TeacherPinStudentComponent} from './teacher-pin-student.component';

describe('TeacherPinStudentComponent', () => {
  let component: TeacherPinStudentComponent;
  let fixture: ComponentFixture<TeacherPinStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherPinStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherPinStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
