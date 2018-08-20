import { TestBed, inject } from '@angular/core/testing';

import { NavbarDataService } from './navbar-data.service';

describe('NavbarDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavbarDataService]
    });
  });

  it('should be created', inject([NavbarDataService], (service: NavbarDataService) => {
    expect(service).toBeTruthy();
  }));
});
