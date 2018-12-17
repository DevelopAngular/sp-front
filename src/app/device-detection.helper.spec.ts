import { TestBed, inject } from '@angular/core/testing';

import { DeviceDetectionService } from './device-detection.helper';

describe('DeviceDetectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeviceDetectionService]
    });
  });

  it('should be created', inject([DeviceDetectionService], (service: DeviceDetectionService) => {
    expect(service).toBeTruthy();
  }));
});
