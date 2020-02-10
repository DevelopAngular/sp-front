import { TestBed, async, inject } from '@angular/core/testing';

import { SchoolSignUpGuard } from './school-sign-up.guard';

describe('SchoolSignUpGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchoolSignUpGuard]
    });
  });

  it('should ...', inject([SchoolSignUpGuard], (guard: SchoolSignUpGuard) => {
    expect(guard).toBeTruthy();
  }));
});
