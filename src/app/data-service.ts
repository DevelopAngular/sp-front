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
  private inboxSource = new BehaviorSubject<boolean>(false);
  inboxState = this.inboxSource.asObservable();

  updateInbox(state: boolean){
    this.inboxSource.next(state);
  }

  private hmSearchSource = new BehaviorSubject<string>('');
  hmSearch = this.hmSearchSource.asObservable();

  updateHMSearch(hmSearch: string){
    this.hmSearchSource.next(hmSearch);
  }

  private hmSortSource = new BehaviorSubject<string>('');
  hmSort = this.hmSortSource.asObservable();

  updateHMSort(hmSort: string){
    this.hmSortSource.next(hmSort);
  }

  private mrRoomSource = new BehaviorSubject<Location>(null);
  mrRoom = this.mrRoomSource.asObservable();

  updateMRRoom(mrRoom: Location){
    this.mrRoomSource.next(mrRoom);
  }

  private mrSearchSource = new BehaviorSubject<string>('');
  mrSearch = this.mrSearchSource.asObservable();

  updateMRSearch(mrSearch: string){
    this.mrSearchSource.next(mrSearch);
  }

  private mrDateSource = new BehaviorSubject<Date>(new Date());
  mrDate = this.mrDateSource.asObservable();

  updateMRDate(mrDate: Date){
    this.mrDateSource.next(mrDate);
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
