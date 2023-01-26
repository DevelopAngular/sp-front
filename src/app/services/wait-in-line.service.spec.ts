import { TestBed } from '@angular/core/testing';

import { WaitInLineService } from './wait-in-line.service';

describe('WaitInLineService', () => {
  let service: WaitInLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaitInLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
