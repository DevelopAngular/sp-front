import { Injectable } from '@angular/core';

import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/scan';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import { HttpService } from './http-service';
import { HallPass, Invitation } from './NewModels';
import { PollingEvent, PollingService } from './polling-service';
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

  updateInbox(state: boolean) {
    this.inboxSource.next(state);
  }

  private hmSearchSource = new BehaviorSubject<string>('');
  hmSearch = this.hmSearchSource.asObservable();

  updateHMSearch(hmSearch: string) {
    this.hmSearchSource.next(hmSearch);
  }

  private hmSortSource = new BehaviorSubject<string>('');
  hmSort = this.hmSortSource.asObservable();

  updateHMSort(hmSort: string) {
    this.hmSortSource.next(hmSort);
  }

  private mrRoomSource = new BehaviorSubject<Location>(null);
  mrRoom = this.mrRoomSource.asObservable();

  updateMRRoom(mrRoom: Location) {
    this.mrRoomSource.next(mrRoom);
  }

  private mrSearchSource = new BehaviorSubject<string>('');
  mrSearch = this.mrSearchSource.asObservable();

  updateMRSearch(mrSearch: string) {
    this.mrSearchSource.next(mrSearch);
  }

  private mrDateSource = new BehaviorSubject<Date>(new Date());
  mrDate = this.mrDateSource.asObservable();

  updateMRDate(mrDate: Date) {
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

  watchActiveHallPasses(sortEvents: Observable<string>): Observable<HallPass[]> {
    const wrappedSortEvents = sortEvents.map(sort => ({sort: sort}));
    const passEvents = this.polling.listen('hall_pass');
    const events = Observable.merge(wrappedSortEvents, passEvents, Observable.of('reload'));

    interface State {
      passes: HallPass[];
      filtered_passes: HallPass[];
      pass_lookup: { [id: number]: HallPass };
      sort?: string;
    }

    interface SortOption {
      sort: string;
    }

    type Action = PollingEvent | SortOption | 'reload';

    function isPollingEvent(x: Action): x is PollingEvent {
      return (<PollingEvent>x).action !== undefined;
    }

    function isSortOption(x: Action): x is SortOption {
      return (<SortOption>x).sort !== undefined;
    }

    const accumulator = (state: State, action: Action) => {
      console.log('acc()', state, action);
      if (action === 'reload') {
        // do nothing
      } else if (isSortOption(action)) {
        state.sort = action.sort;
      } else if (isPollingEvent(action)) {

        const actors = {
          'hall_pass.create': (s: State, data) => {
            const pass = HallPass.fromJSON(data);

            s.passes.push(pass);
            s.pass_lookup[pass.id] = pass;

            return s;
          }
        };

        if (actors.hasOwnProperty(action.action)) {
          state = actors[action.action](state, action.data);
        } else {
          console.error(`unknown hall pass event: ${action.action}. State is most likely invalid`);
        }
      } else {
        throw new Error(`Unknown action: ${action} for state: ${state}`);
      }

      if (state.sort) {

        const compareString = (a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());

        const sortFns = {
          'created': (a: HallPass, b: HallPass) => (+a.created) - (+b.created),
          'expiration_time': (a: HallPass, b: HallPass) => (+a.expiration_time) - (+b.expiration_time),
          'destination_name': (a: HallPass, b: HallPass) => compareString(a.destination.title, b.destination.title),
          'student_name': (a: HallPass, b: HallPass) => compareString(a.student.display_name, b.student.display_name),
        };

        for (const key of Object.keys(sortFns)) {
          const sorter = sortFns[key];
          sortFns['-' + key] = (a, b) => -sorter(a, b);
        }

        if (sortFns[state.sort]) {
          state.passes = state.passes.sort(sortFns[state.sort]);
        } else {
          console.error(`Unknown sort type: ${state.sort}`);
          delete state.sort;
        }

        state.filtered_passes = state.passes;

      }

      return state;
    };

    return this.http.get<any[]>(constructUrl('api/methacton/v1/hall_passes', {active: 'true'}))
      .pipe(
        map(json => json.map(raw => HallPass.fromJSON(raw))),
        switchMap(passes => events.scan(accumulator, {passes: passes, filtered_passes: passes, pass_lookup: {}})),
        map(state => state.filtered_passes)
      );
  }

  reloadInvitations() {
    this.updateInvitations.next(null);
  }

}
