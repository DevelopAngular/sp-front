import { inject, TestBed } from '@angular/core/testing';

import { IsStudentOrTeacherGuard } from './is-student-or-teacher.guard';

describe('IsStudentOrTeacherGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IsStudentOrTeacherGuard]
    });
  });

  it('should ...', inject([IsStudentOrTeacherGuard], (guard: IsStudentOrTeacherGuard) => {
    expect(guard).toBeTruthy();
  }));
});
