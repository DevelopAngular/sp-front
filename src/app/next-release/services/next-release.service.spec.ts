import { TestBed } from '@angular/core/testing';

import { NextReleaseService } from './next-release.service';

describe('NextReleaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NextReleaseService = TestBed.get(NextReleaseService);
    expect(service).toBeTruthy();
  });
});
