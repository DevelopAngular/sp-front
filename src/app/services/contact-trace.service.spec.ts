import {TestBed} from '@angular/core/testing';

import {ContactTraceService} from './contact-trace.service';

describe('ContactTraceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContactTraceService = TestBed.get(ContactTraceService);
    expect(service).toBeTruthy();
  });
});
