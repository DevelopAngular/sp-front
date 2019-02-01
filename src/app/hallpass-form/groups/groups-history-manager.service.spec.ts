import { TestBed } from '@angular/core/testing';

import { GroupsHistoryManagerService } from './groups-history-manager.service';

describe('GroupsHistoryManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupsHistoryManagerService = TestBed.get(GroupsHistoryManagerService);
    expect(service).toBeTruthy();
  });
});
