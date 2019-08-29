import { TestBed } from '@angular/core/testing';

import { IosDateSingleton } from './ios-date.singleton';

describe('IosDate.SingletonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IosDateSingleton = TestBed.get(IosDateSingleton);
    expect(service).toBeTruthy();
  });
});
