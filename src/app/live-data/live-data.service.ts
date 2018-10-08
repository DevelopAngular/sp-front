import { Injectable } from '@angular/core';
import 'rxjs/add/observable/empty';

import 'rxjs/add/operator/startWith';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { HttpService } from '../http-service';
import { Paged, PassLike } from '../models';
import { BaseModel } from '../models/base';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Location } from '../models/Location';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { PollingEvent, PollingService } from '../polling-service';
import {
  Action,
  ExternalEvent,
  isExternalEvent,
  isPollingEvent,
  isTransformFunc,
  PollingEventContext,
  PollingEventHandler,
  TransformFunc
} from './events';
import { filterHallPasses, filterNewestFirst, identityFilter } from './filters';
import { constructUrl, QueryParams } from './helpers';
import { AddItem, makePollingEventHandler, RemoveInvitationOnApprove, RemoveItem, RemoveRequestOnApprove } from './polling-event-handlers';
import { State } from './state';


interface WatchData<ModelType extends BaseModel, ExternalEventType> {
  externalEvents: Observable<ExternalEventType>;
  eventNamespace: string;
  initialUrl: string;
  rawDecoder?: (any) => ModelType;
  decoder: (any) => ModelType;
  handleExternalEvent: (state: State<ModelType>, e: ExternalEventType) => State<ModelType>;
  handlePollingEvent: PollingEventHandler<ModelType>;
  handlePost: (state: State<ModelType>) => State<ModelType>;
}

function getDateLimits(date: Date) {
  const start = new Date(+date);

  start.setHours(0, 0, 0, 0);

  const end = new Date((+date) + 24 * 60 * 60 * 1000);

  return {start, end};
}


type FilterFunc<T> = (item: T) => boolean;

function mergeFilters<T>(filters: FilterFunc<T>[]) {
  return (item: T) => {
    for (const filter of filters) {
      if (!filter(item)) {
        return false;
      }
    }

    return true;
  };
}

export type PassFilterType = { type: 'issuer', value: User } | { type: 'student', value: User } | { type: 'location', value: Location };

export type RequestFilterType =
  { type: 'issuer', value: User }
  | { type: 'student', value: User }
  | { type: 'destination', value: Location };

export interface HallPassFilter {
  sort: string;
  search_query: string;
}


@Injectable({
  providedIn: 'root'
})
export class LiveDataService {

  constructor(private http: HttpService, private polling: PollingService) {
  }

  private watch<ModelType extends BaseModel, ExternalEventType>(config: WatchData<ModelType, ExternalEventType>):
    Observable<ModelType[]> {

    const wrappedExternalEvents: Observable<ExternalEvent<ExternalEventType>> = config.externalEvents
      .map(event => (<ExternalEvent<ExternalEventType>>{type: 'external-event', event: event}));

    const loopbackEvents = new Subject<TransformFunc<ModelType>>();

    function postDelayed(ms: number, func: (s: State<ModelType>) => State<ModelType>) {
      setTimeout(() => {
        loopbackEvents.next({type: 'transform-func', func: func});
      }, ms);
    }

    function wrapPollingEvent(event: PollingEvent): PollingEventContext<ModelType> {
      return {
        type: 'polling-event',
        event: event,
        postDelayed: postDelayed
      };
    }

    const passEvents: Observable<PollingEventContext<ModelType>> = this.polling.listen().map(wrapPollingEvent);

    const events: Observable<Action<ModelType, ExternalEventType>> = Observable.merge(wrappedExternalEvents, passEvents,
      loopbackEvents, Observable.of<'reload'>('reload'));

    const accumulator = (state: State<ModelType>, action: Action<ModelType, ExternalEventType>) => {
      //console.log('acc()', state, action);
      if (action === 'reload') {
        // do nothing
      } else if (isExternalEvent(action)) {
        state = config.handleExternalEvent(state, action.event);
      } else if (isTransformFunc(action)) {
        state = action.func(state);
      } else if (isPollingEvent(action)) {
        state = config.handlePollingEvent(state, action);
      } else {
        throw new Error(`Unknown action: ${action} for state: ${state}`);
      }

      state = config.handlePost(state);

      return state;
    };

    const rawDecoder = config.rawDecoder !== undefined ? config.rawDecoder
      : (json) => json.results.map(raw => config.decoder(raw));

    return this.http.get<Paged<any>>(config.initialUrl)
      .pipe(
        map(rawDecoder),
        switchMap(passes => events.scan<Action<ModelType, ExternalEventType>, State<ModelType>>(accumulator, new State(passes))),
        map(state => state.filtered_passes)
      );
  }

  watchHallPassesFromLocation(sortingEvents: Observable<HallPassFilter>, filter: Location, date: Date = null): Observable<HallPass[]> {
    const queryFilter: QueryParams = {
      limit: 20,
      origin: filter.id
    };
    const filters: FilterFunc<HallPass>[] = [pass => pass.origin.id === filter.id];

    if (date !== null) {
      const limits = getDateLimits(date);
      queryFilter.start_time_after = limits.start.toISOString();
      queryFilter.start_time_before = limits.end.toISOString();
      filters.push(pass => limits.start <= pass.start_time && pass.start_time <= limits.end);
    }

    return this.watch<HallPass, HallPassFilter>({
      externalEvents: sortingEvents,
      eventNamespace: 'hall_pass',
      initialUrl: constructUrl('v1/hall_passes', queryFilter),
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: HallPassFilter) => {
        s.sort = e.sort;
        s.filter_query = e.search_query;
        return s;
      },
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.create', 'hall_pass.update', 'hall_pass.end', 'pass_request.accept', 'pass_invitation.accept'],
          HallPass.fromJSON, mergeFilters(filters)),
      ]),
      handlePost: filterHallPasses
    });
  }

  watchHallPassesToLocation(sortingEvents: Observable<HallPassFilter>, filter: Location, date: Date = null): Observable<HallPass[]> {
    const queryFilter: QueryParams = {
      limit: 20,
      destination: filter.id
    };
    const filters: FilterFunc<HallPass>[] = [pass => pass.destination.id === filter.id];

    if (date !== null) {
      const limits = getDateLimits(date);
      queryFilter.start_time_after = limits.start.toISOString();
      queryFilter.start_time_before = limits.end.toISOString();
      filters.push(pass => limits.start <= pass.start_time && pass.start_time <= limits.end);
    }

    return this.watch<HallPass, HallPassFilter>({
      externalEvents: sortingEvents,
      eventNamespace: 'hall_pass',
      initialUrl: constructUrl('v1/hall_passes', queryFilter),
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: HallPassFilter) => {
        s.sort = e.sort;
        s.filter_query = e.search_query;
        return s;
      },
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.create', 'hall_pass.update', 'hall_pass.end', 'pass_request.accept', 'pass_invitation.accept'],
          HallPass.fromJSON, mergeFilters(filters)),
      ]),
      handlePost: filterHallPasses
    });
  }

  watchActiveHallPasses(sortingEvents: Observable<HallPassFilter>, filter?: PassFilterType, date: Date = null): Observable<HallPass[]> {
    const queryFilter: QueryParams = {
      limit: 20,
      active: true
    };
    const filters: FilterFunc<HallPass>[] = [];

    if (filter) {
      if (filter.type === 'issuer') {
        queryFilter.issuer = filter.value.id;
        filters.push(pass => pass.issuer.id === filter.value.id);
      }
      if (filter.type === 'student') {
        queryFilter.student = filter.value.id;
        filters.push(pass => pass.student.id === filter.value.id);

      }
      if (filter.type === 'location') {
        queryFilter.location = filter.value.id;
        filters.push(pass => pass.origin.id === filter.value.id || pass.destination.id === filter.value.id);
      }
    }

    if (date !== null) {
      const limits = getDateLimits(date);
      queryFilter.start_time_after = limits.start.toISOString();
      queryFilter.start_time_before = limits.end.toISOString();
      filters.push(pass => limits.start <= pass.start_time && pass.start_time <= limits.end);
    }

    return this.watch<HallPass, HallPassFilter>({
      externalEvents: sortingEvents,
      eventNamespace: 'hall_pass',
      initialUrl: constructUrl('v1/hall_passes', queryFilter),
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: HallPassFilter) => {
        s.sort = e.sort;
        s.filter_query = e.search_query;
        return s;
      },
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.start', 'pass_request.accept', 'pass_invitation.accept'],
          HallPass.fromJSON, mergeFilters(filters)),
        new RemoveItem(['hall_pass.end', 'hall_pass.cancel'], HallPass.fromJSON)
      ]),
      handlePost: filterHallPasses
    });
  }

  watchFutureHallPasses(filter?: PassFilterType): Observable<HallPass[]> {
    let queryFilter = '';
    let filterFunc = (pass: HallPass) => true;

    if (filter) {
      if (filter.type === 'issuer') {
        queryFilter = `&issuer=${filter.value.id}`;
        filterFunc = (pass: HallPass) => pass.issuer.id === filter.value.id;
      }

      if (filter.type === 'student') {
        queryFilter = `&student=${filter.value.id}`;
        filterFunc = (pass: HallPass) => pass.student.id === filter.value.id;

      }
      if (filter.type === 'location') {
        queryFilter = `&location=${filter.value.id}`;
        filterFunc = (pass: HallPass) => pass.origin.id === filter.value.id || pass.destination.id === filter.value.id;

      }
    }

    return this.watch<HallPass, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'hall_pass',
      initialUrl: `v1/hall_passes?limit=20&active=future${queryFilter}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.create', 'hall_pass.update', 'pass_request.accept', 'pass_invitation.accept'], HallPass.fromJSON,
          (pass) => filterFunc(pass) && pass.start_time > new Date()),
        new RemoveItem(['hall_pass.start', 'hall_pass.cancel'], HallPass.fromJSON)
      ]),
      handlePost: (s: State<HallPass>) => {
        s.sort = 'start_time';
        return filterHallPasses(s);
      }
    });
  }

  watchPastHallPasses(filter?: PassFilterType): Observable<HallPass[]> {
    let queryFilter = '';
    let filterFunc = (pass: HallPass) => true;

    if (filter) {
      if (filter.type === 'issuer') {
        queryFilter = `&issuer=${filter.value.id}`;
        filterFunc = (pass: HallPass) => pass.issuer.id === filter.value.id;
      }

      if (filter.type === 'student') {
        queryFilter = `&student=${filter.value.id}`;
        filterFunc = (pass: HallPass) => pass.student.id === filter.value.id;

      }
      if (filter.type === 'location') {
        queryFilter = `&location=${filter.value.id}`;
        filterFunc = (pass: HallPass) => pass.origin.id === filter.value.id || pass.destination.id === filter.value.id;

      }
    }

    return this.watch<HallPass, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'hall_pass',
      initialUrl: `v1/hall_passes?limit=20&active=past${queryFilter}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.end', 'pass_request.accept', 'pass_invitation.accept'], HallPass.fromJSON, filterFunc)
      ]),
      handlePost: (s: State<HallPass>) => {
        s.sort = '-start_time';
        return filterHallPasses(s);
      }
    });
  }

  watchInboxRequests(filter: User): Observable<Request[]> {
    const isStudent = filter.roles.includes('hallpass_student');

    return this.watch<Request, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'pass_request',
      initialUrl: `v1/inbox/${isStudent ? 'student' : 'teacher'}`,
      rawDecoder: (json) => json.pass_requests.map(d => Request.fromJSON(d)),
      decoder: data => Request.fromJSON(data),
      handleExternalEvent: (s: State<Request>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_request.create', 'pass_request.update'], Request.fromJSON),
        new RemoveItem(['pass_request.deny', 'pass_request.cancel'], Request.fromJSON),
        new RemoveRequestOnApprove(['pass_request.accept'])
      ]),
      handlePost: filterNewestFirst
    });
  }

  watchInboxInvitations(filter: User): Observable<Invitation[]> {
    const isStudent = filter.roles.includes('hallpass_student');

    return this.watch<Invitation, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'pass_invitation',
      initialUrl: `v1/inbox/${isStudent ? 'student' : 'teacher'}`,
      rawDecoder: (json) => json.invitations.map(d => Invitation.fromJSON(d)),
      decoder: data => Invitation.fromJSON(data),
      handleExternalEvent: (s: State<Invitation>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_invitation.create', 'pass_invitation.update'], Invitation.fromJSON),
        new RemoveItem(['pass_invitation.deny', 'pass_invitation.cancel'], Invitation.fromJSON),
        new RemoveInvitationOnApprove(['pass_invitation.accept'])
      ]),
      handlePost: filterNewestFirst
    });
  }

  watchActiveRequests(filter: User | Location = null): Observable<Request[]> {
    let queryFilter = '';
    let filterFunc = (pass: Request) => true;

    if (filter instanceof User) {
      queryFilter = `&student=${filter.id}`;
      filterFunc = (pass: Request) => pass.student.id === filter.id;

    } else if (filter instanceof Location) {
      queryFilter = `&destination=${filter.id}`;
      filterFunc = (pass: Request) => pass.destination.id === filter.id;

    } else if (filter !== null) {
      throw Error(`Unknown filter arg: ${filter}`);
    }

    return this.watch<Request, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'pass_request',
      initialUrl: `v1/pass_requests?limit=20&active=true${queryFilter}`,
      decoder: data => Request.fromJSON(data),
      handleExternalEvent: (s: State<Request>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_request.create'], Request.fromJSON, filterFunc),
        new RemoveItem(['pass_request.cancel'], Request.fromJSON)
      ]),
      handlePost: identityFilter
    });
  }

  watchActivePassLike(student: User): Observable<PassLike> {

    const passes$ = this.watchActiveHallPasses(Observable.empty(), {type: 'student', value: student});
    const requests$ = this.watchActiveRequests(student);

    const merged$ = Observable.combineLatest(
      passes$.map(passes => passes.length ? passes[0] : null).startWith(null),
      requests$.map(requests => requests.length ? requests[0] : null).startWith(null),
      (pass, request) => ({pass: pass, request: request}));

    return merged$.map(m => {
      if (m.pass) {
        return m.pass;
      }
      if (m.request) {
        return m.request;
      }
      return null;
    });
  }

}
