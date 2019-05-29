import { TestBed, async, inject } from '@angular/core/testing';

import { NotKioskModeGuard } from './not-kiosk-mode.guard';

describe('NotKioskModeGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotKioskModeGuard]
    });
  });

  it('should ...', inject([NotKioskModeGuard], (guard: NotKioskModeGuard) => {
    expect(guard).toBeTruthy();
  }));
});
