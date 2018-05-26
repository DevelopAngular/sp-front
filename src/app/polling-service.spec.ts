import { TestBed, inject } from '@angular/core/testing';

import { PollingService } from './polling-service';

describe('PollingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PollingService]
    });
  });

  it('should be created', inject([PollingService], (service: PollingService) => {
    expect(service).toBeTruthy();
  }));
});
