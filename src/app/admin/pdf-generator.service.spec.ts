import { TestBed, inject } from '@angular/core/testing';

import { PdfGeneratorService } from './pdf-generator.service';

describe('PdfGeneratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfGeneratorService]
    });
  });

  it('should be created', inject([PdfGeneratorService], (service: PdfGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
