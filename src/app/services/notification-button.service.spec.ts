import { TestBed } from '@angular/core/testing';

import { NotificationButtonService } from './notification-button.service';

describe('NotificationButtonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationButtonService = TestBed.get(NotificationButtonService);
    expect(service).toBeTruthy();
  });
});
