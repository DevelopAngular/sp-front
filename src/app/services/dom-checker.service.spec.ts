import { TestBed } from '@angular/core/testing';

import { DomCheckerService } from './dom-checker.service';

describe('DomCheckerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DomCheckerService = TestBed.get(DomCheckerService);
    expect(service).toBeTruthy();
  });
});
