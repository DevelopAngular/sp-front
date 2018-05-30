import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import { HttpService } from './http-service';
import { Invitation } from './NewModels';
import { PollingService } from './polling-service';
import { UserService } from './user.service';

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

  // userService = new BehaviorSubject<User>(null);
  currentUser = this.userService.userData.asObservable();
  private updateInvitations = new BehaviorSubject<void>(null);

  constructor(private userService: UserService, private http: HttpService, private polling: PollingService) {

    this.polling.listen('invitation')
      .subscribe(() => this.updateInvitations.next(null));

  }

  watchInvitations(options: Partial<InvitationOptions>): Observable<Invitation[]> {
    return this.updateInvitations.pipe(
      switchMap(() => {

        return this.http.get<any[]>(constructUrl('api/methacton/v1/invitations', options))
          .pipe(map(json => json.map(raw => Invitation.fromJSON(raw))));
      })
    );
  }

  reloadInvitations() {
    this.updateInvitations.next(null);
  }

}
