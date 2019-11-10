import { TestBed } from '@angular/core/testing';

import { NavbarElementsRefsService } from './navbar-elements-refs.service';

describe('NavbarElementsRefsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NavbarElementsRefsService = TestBed.get(NavbarElementsRefsService);
    expect(service).toBeTruthy();
  });
});
