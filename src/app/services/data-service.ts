import { Injectable } from '@angular/core';

import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/scan';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpService } from './http-service';
import { PassLike } from '../models/index';
import { Invitation } from '../models/Invitation';
import { Location } from '../models/Location';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { PollingService } from './polling-service';
import { UserService } from './user.service';
import {ReplaySubject, Subject} from 'rxjs';
import { HallPass } from '../models/HallPass';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface InvitationOptions {
  student: number | string;
  status: string;
}

interface QueryParams {
  [key: string]: number | string;
}

function hasKey<T>(obj: T, key: keyof T): boolean {
  return Object.hasOwnProperty.bind(obj, key);
}

function encode(obj: Partial<QueryParams>): string {
  return Object.keys(obj).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key].toString())}`).join('&');

}

function constructUrl(base: string, obj: Partial<QueryParams>): string {
  const query = encode(obj);
  if (query) {
    return `${base}?${query}`;
  } else {
    return base;
  }
}

@Injectable()
export class DataService {
  private inboxSource = new BehaviorSubject<boolean>(false);
  public sort$ = new Subject<string>();
  inboxState = this.inboxSource.asObservable();

  updateInbox(state: boolean) {
    this.inboxSource.next(state);
  }

  updateHMSearch(hmSearch: string) {
  }

  updateHMSort(hmSort: string) {
  }

  updateMRRoom(mrRoom: Location) {
  }

  updateMRSearch(mrSearch: string) {
  }

  updateMRDate(mrDate: Date) {
  }

  currentUser = this.userService.userData.asObservable();
  private updateInvitations = new BehaviorSubject<void>(null);

  constructor(private userService: UserService, private http: HttpService, private polling: PollingService) {
    this.polling.listen('pass_invitation')
      .subscribe((pollingEvent) => {
        // this.updateInvitations.next(null);
        console.log('[Invitation Poll]', pollingEvent);
      });
  }

  watchInvitationsSlow(options: Partial<InvitationOptions>): Observable<Invitation[]> {
    return this.updateInvitations.pipe(
      switchMap(() => {
        return this.http.get<any[]>(constructUrl('v1/invitations', options))
          .pipe(map(json => json.map(raw => Invitation.fromJSON(raw))));
      })
    );
  }

  getLocationsWithTeacher(teacher: User) {
    return this.http.get<any[]>(`v1/locations?teacher_id=${teacher.id}`)
      .map(json => json.map(raw => Location.fromJSON(raw)));
  }

  markRead(pass: PassLike): Observable<any> {
    let endpoint = 'v1/';

    if (pass instanceof HallPass) {
      endpoint += 'hall_passes/';
    } else if (pass instanceof Invitation) {
      endpoint += 'invitations/';
    } else if (pass instanceof Request) {
      endpoint += 'pass_requests/';
    }

    endpoint += `${pass.id}/read`;

    return this.http.post(endpoint);
  }

  reloadInvitations() {
    this.updateInvitations.next(null);
  }

}
