import { TestBed } from '@angular/core/testing';

import { HallPassesService } from './hall-passes.service';

describe('HallPassesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HallPassesService = TestBed.get(HallPassesService);
    expect(service).toBeTruthy();
  });
});
