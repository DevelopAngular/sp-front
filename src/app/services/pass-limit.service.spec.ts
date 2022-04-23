import { TestBed } from '@angular/core/testing';

import { PassLimitService } from './pass-limit.service';

describe('PassLimitService', () => {
  let service: PassLimitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PassLimitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
