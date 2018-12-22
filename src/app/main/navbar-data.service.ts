import { Injectable } from '@angular/core';

import { combineLatest } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataService } from '../data-service';
import { LiveDataService } from '../live-data/live-data.service';
import { UserService } from '../user.service';

function count<T>(items: T[], fn: (item: T) => boolean): number {
  let acc = 0;
  for (const item of items) {
    if (fn(item)) {
      acc++;
    }
  }
  return acc;
}

@Injectable({
  providedIn: 'root'
})
export class NavbarDataService {

  notificationBadge$ = new BehaviorSubject(0);

  constructor(private userService: UserService, private dataService: DataService, private liveData: LiveDataService) {


    const badgeCount$ = this.userService.userData.switchMap(user => {

      const invitationCount$ = this.liveData.watchInboxInvitations(user)
        .map(invitations => count(invitations, invitation => !invitation.isRead));

      const requestCount$ = this.liveData.watchInboxRequests(user)
        .map(requests => count(requests, request => !request.isRead));

      return combineLatest(
        invitationCount$, requestCount$,
        (iCount, rCount) => iCount + rCount
      );
    });

    badgeCount$.subscribe(this.notificationBadge$);


  }
}
