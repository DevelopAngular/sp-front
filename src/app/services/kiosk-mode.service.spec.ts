import { TestBed } from '@angular/core/testing';

import { KioskModeService } from './kiosk-mode.service';

describe('KioskModeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KioskModeService = TestBed.get(KioskModeService);
    expect(service).toBeTruthy();
  });
});
