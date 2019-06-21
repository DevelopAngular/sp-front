import { TestBed } from '@angular/core/testing';

import { GettingStartedProgressService } from './getting-started-progress.service';

describe('GettingStartedProgressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GettingStartedProgressService = TestBed.get(GettingStartedProgressService);
    expect(service).toBeTruthy();
  });
});
