import {ElementRef, Injectable} from '@angular/core';

import { combineLatest ,  BehaviorSubject } from 'rxjs';
import { DataService } from '../services/data-service';
import { LiveDataService } from '../live-data/live-data.service';
import { UserService } from '../services/user.service';
import {map, switchMap} from 'rxjs/operators';

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

  public inboxClick$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private userService: UserService, private dataService: DataService, private liveData: LiveDataService) {


    const badgeCount$ = this.userService.userData.pipe(
      switchMap(user => {

        const invitationCount$ = this.liveData.watchInboxInvitations(user)
          .pipe(map(invitations => count(invitations, invitation => !invitation.isRead)));

        const requestCount$ = this.liveData.watchInboxRequests(user)
          .pipe(map(requests => count(requests, request => !request.isRead)));

        return combineLatest(
          invitationCount$, requestCount$,
          (iCount, rCount) => iCount + rCount
        );
      })
    );

    badgeCount$.subscribe(this.notificationBadge$);


  }
}
