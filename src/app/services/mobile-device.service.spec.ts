import { TestBed } from '@angular/core/testing';

import { MobileDeviceService } from './mobile-device.service';

describe('MobileDeviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MobileDeviceService = TestBed.get(MobileDeviceService);
    expect(service).toBeTruthy();
  });
});
