import {TestBed} from '@angular/core/testing';

import {SmartpassSearchService} from './smartpass-search.service';

describe('SmartpassSearchService', () => {
  let service: SmartpassSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartpassSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
