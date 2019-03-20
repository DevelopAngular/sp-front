import { TestBed } from '@angular/core/testing';

import { WebConnectionService } from './web-connection.service';

describe('WebConnectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebConnectionService = TestBed.get(WebConnectionService);
    expect(service).toBeTruthy();
  });
});
