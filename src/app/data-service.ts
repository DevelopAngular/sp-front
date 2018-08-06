import { Injectable } from '@angular/core';

import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/scan';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { HttpService } from './http-service';
import { PassLike } from './models';
import { HallPass } from './models/HallPass';
import { Invitation } from './models/Invitation';
import { Location } from './models/Location';
import { User } from './models/User';
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
    interface State {
      passes: HallPass[];
      filtered_passes: HallPass[];
      pass_lookup: { [id: number]: HallPass };
      sort?: string;
    }

    interface SortOption {
      sort: string;
    }

    interface TransformFunc {
      type: 'transform-func';
      func: (s: State) => State;
    }

    type Action = PollingEvent | SortOption | TransformFunc | 'reload';

    function isPollingEvent(x: Action): x is PollingEvent {
      return (<PollingEvent>x).action !== undefined;
    }

    function isSortOption(x: Action): x is SortOption {
      return (<SortOption>x).sort !== undefined;
    }

    function isTransformFunc(x: Action): x is TransformFunc {
      return (<TransformFunc>x).type === 'transform-func';
    }

    const wrappedSortEvents = sortEvents.map(sort => ({sort: sort}));
    const passEvents = this.polling.listen('hall_pass');
    const loopbackEvents = new Subject<TransformFunc>();
    const events = Observable.merge(wrappedSortEvents, passEvents, loopbackEvents, Observable.of('reload'));

    function postDelayed(ms: number, func: (s: State) => State) {
      setTimeout(() => {
        loopbackEvents.next({type: 'transform-func', func: func});
      }, ms);
    }

    const accumulator = (state: State, action: Action) => {
      console.log('acc()', state, action);
      if (action === 'reload') {
        // do nothing
      } else if (isSortOption(action)) {
        state.sort = action.sort;
      } else if (isTransformFunc(action)) {
        state = action.func(state);
      } else if (isPollingEvent(action)) {

        const actors = {
          'hall_pass.start': (s: State, data: any) => {
            const pass = HallPass.fromJSON(data);

            s.passes.push(pass);
            s.pass_lookup[pass.id] = pass;

            return s;
          },
          'hall_pass.end': (s: State, data: any) => {
            const pass = HallPass.fromJSON(data);

            for (let i = 0; i < s.passes.length; i++) {
              if (s.passes[i].id === pass.id) {
                s.passes[i] = pass;
              }
            }

            s.pass_lookup[pass.id] = pass;

            postDelayed(60 * 1000, (s1: State) => {
              s1.passes = s1.passes.filter(p => p.id !== pass.id);
              delete s1.pass_lookup[pass.id];

              return s1;
            });

            return s;
          },
        };

        actors['hall_pass.cancel'] = actors['hall_pass.end'];

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
      }

      state.filtered_passes = state.passes;

      return state;
    };

    return this.http.get<any[]>(constructUrl('api/methacton/v1/hall_passes', {active: 'true'}))
      .pipe(
        map(json => json.map(raw => HallPass.fromJSON(raw))),
        switchMap(passes => events.scan(accumulator, {passes: passes, filtered_passes: passes, pass_lookup: {}})),
        map(state => state.filtered_passes)
      );
  }

  getLocationsWithTeacher(teacher: User) {
    return this.http.get<any[]>(`api/methacton/v1/locations?teacher_id=${teacher.id}`)
      .map(json => json.map(raw => Location.fromJSON(raw)));
  }

  markRead(pass: PassLike): Observable<any> {
    let endpoint = 'api/methacton/v1/';

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
