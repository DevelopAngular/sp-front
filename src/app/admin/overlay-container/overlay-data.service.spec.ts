import { TestBed } from '@angular/core/testing';

import { OverlayDataService } from './overlay-data.service';

describe('OverlayDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OverlayDataService = TestBed.get(OverlayDataService);
    expect(service).toBeTruthy();
  });
});
