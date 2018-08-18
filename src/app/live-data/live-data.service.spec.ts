import { TestBed, inject } from '@angular/core/testing';

import { LiveDataService } from './live-data.service';

describe('LiveDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LiveDataService]
    });
  });

  it('should be created', inject([LiveDataService], (service: LiveDataService) => {
    expect(service).toBeTruthy();
  }));
});
