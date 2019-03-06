import { TestBed } from '@angular/core/testing';

import { XlsxGeneratorService } from './xlsx-generator.service';

describe('XlsxGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: XlsxGeneratorService = TestBed.get(XlsxGeneratorService);
    expect(service).toBeTruthy();
  });
});
