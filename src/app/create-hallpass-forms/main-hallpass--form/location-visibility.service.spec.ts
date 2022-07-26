import { TestBed } from '@angular/core/testing';

import { LocationVisibilityService } from './location-visibility.service';

describe('LocationVisibilityService', () => {
  let service: LocationVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
