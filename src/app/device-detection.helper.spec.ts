import { TestBed, inject } from '@angular/core/testing';

import { DeviceDetection } from './device-detection.helper';

describe('DeviceDetectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeviceDetection]
    });
  });

  it('should be created', inject([DeviceDetection], (service: DeviceDetection) => {
    expect(service).toBeTruthy();
  }));
});
