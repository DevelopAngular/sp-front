import { TestBed, async, inject } from '@angular/core/testing';

import { NotSeenIntroGuard } from './not-seen-intro.guard';

describe('NotSeenIntroGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotSeenIntroGuard]
    });
  });

  it('should ...', inject([NotSeenIntroGuard], (guard: NotSeenIntroGuard) => {
    expect(guard).toBeTruthy();
  }));
});
