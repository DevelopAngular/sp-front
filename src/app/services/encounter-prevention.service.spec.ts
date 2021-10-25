import {TestBed} from '@angular/core/testing';

import {EncounterPreventionService} from './encounter-prevention.service';

describe('EncounterPreventionService', () => {
  let service: EncounterPreventionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncounterPreventionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
