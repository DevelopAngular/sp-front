import { Injectable } from '@angular/core';
import * as Fuse from 'fuse.js';
import 'rxjs/add/observable/empty';

import 'rxjs/add/operator/startWith';
import { Observable } from 'rxjs/Observable';
import { map, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { HttpService } from './http-service';
import { Paged, PassLike } from './models';
import { BaseModel } from './models/base';
import { HallPass } from './models/HallPass';
import { Invitation } from './models/Invitation';
import { Location } from './models/Location';
import { Request } from './models/Request';
import { User } from './models/User';
import { PollingEvent, PollingService } from './polling-service';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface QueryParams {
  [key: string]: number | string;
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

class State<ModelType extends BaseModel> {
  passes: ModelType[];
  filtered_passes: ModelType[];
  pass_lookup: { [id: number]: ModelType };
  sort = '-created';
  filter_query = '';

  constructor(passes: ModelType[]) {
    this.passes = Array.from(passes);
    this.filtered_passes = Array.from(passes);
    this.pass_lookup = {};
  }

  addItem(item: ModelType) {
    this.passes.push(item);
    this.pass_lookup[item.id] = item;
  }

  updateItem(item: ModelType) {
    for (let i = 0; i < this.passes.length; i++) {
      if (this.passes[i].id === item.id) {
        this.passes[i] = item;
      }
    }

    this.pass_lookup[item.id] = item;
  }

  addOrUpdateItem(item: ModelType) {
    if (this.pass_lookup[item.id]) {
      this.updateItem(item);
    } else {
      this.addItem(item);
    }
  }

  removeItem(item: ModelType) {
    this.passes = this.passes.filter(p => p.id !== item.id);
    delete this.pass_lookup[item.id];
  }

  removeItemById(id: number|string) {
    const pass = this.pass_lookup[id];
    if (pass !== undefined) {
      this.removeItem(pass);
    }
  }
}

interface ExternalEvent<E> {
  type: 'external-event';
  event: E;
}

interface TransformFunc<ModelType extends BaseModel> {
  type: 'transform-func';
  func: (s: State<ModelType>) => State<ModelType>;
}

interface PollingEventContext<ModelType extends BaseModel> {
  type: 'polling-event';
  event: PollingEvent;

  postDelayed(ms: number, func: (s: State<ModelType>) => State<ModelType>);
}

type Action<ModelType extends BaseModel, E> = PollingEventContext<ModelType> | ExternalEvent<E> | TransformFunc<ModelType> | 'reload';

function isPollingEvent(x: Action<any, any>): x is PollingEventContext<any> {
  return (<PollingEventContext<any>>x).type === 'polling-event';
}

function isExternalEvent(x: Action<any, any>): x is ExternalEvent<any> {
  return (<ExternalEvent<any>>x).type === 'external-event';
}

function isTransformFunc(x: Action<any, any>): x is TransformFunc<any> {
  return (<TransformFunc<any>>x).type === 'transform-func';
}


type PollingEventHandler<ModelType extends BaseModel> = (state: State<ModelType>, e: PollingEventContext<ModelType>) => State<ModelType>;

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


function filterHallPasses(state: State<HallPass>): State<HallPass> {
  if (state.sort) {

    const compareString = (a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());

    const sortFns = {
      'created': (a: HallPass, b: HallPass) => (+a.created) - (+b.created),
      'expiration_time': (a: HallPass, b: HallPass) => (+a.expiration_time) - (+b.expiration_time),
      'start_time': (a: HallPass, b: HallPass) => (+a.start_time) - (+b.start_time),
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

  if (state.filter_query && state.filter_query !== '') {

    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'student.display_name',
        'student.first_name',
        'student.last_name',
        'destination.title',
      ]
    };

    const fuse = new Fuse(state.passes, options);
    state.filtered_passes = fuse.search(state.filter_query);

  } else {
    state.filtered_passes = state.passes;
  }


  return state;
}

function identityFilter<ModelType extends BaseModel>(state: State<ModelType>): State<ModelType> {
  state.filtered_passes = state.passes;

  return state;
}

interface EventHandler<ModelType extends BaseModel> {
  matches(event: PollingEvent): boolean;

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip';
}


abstract class BaseEventHandler<ModelType extends BaseModel> implements EventHandler<ModelType> {

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(private actions: string[]) {
  }

  matches(event: PollingEvent): boolean {
    return this.actions.includes(event.action);
  }

  abstract handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip';

}


class AddItem<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType, private filter?: (pass: ModelType) => boolean) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const dataArray = Array.isArray(data) ? data : [data];

    for (const rawItem of dataArray) {
      const pass = this.decoder(rawItem);
      if (!this.filter || this.filter(pass)) {
        state.addOrUpdateItem(pass);
      }
    }
    return state;
  }
}

class RemoveItem<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const pass = this.decoder(data);
    state.removeItem(pass);

    return state;
  }
}

class RemoveRequestOnApprove extends BaseEventHandler<Request> {
  constructor(actions: string[]) {
    super(actions);
  }

  handle(state: State<Request>, context: PollingEventContext<Request>, data: any): State<Request> | 'skip' {
    const pass = HallPass.fromJSON(data);
    state.removeItemById(pass.parent_request);

    return state;
  }
}

class RemoveInvitationOnApprove extends BaseEventHandler<Invitation> {
  constructor(actions: string[]) {
    super(actions);
  }

  handle(state: State<Invitation>, context: PollingEventContext<Invitation>, data: any): State<Invitation> | 'skip' {
    const pass = HallPass.fromJSON(data);
    state.removeItemById(pass.parent_invitation);

    return state;
  }
}

class RemoveItemWithDelay<ModelType extends PassLike> extends BaseEventHandler<ModelType> {
  constructor(actions: string[], private decoder: (raw: any) => ModelType) {
    super(actions);
  }

  handle(state: State<ModelType>, context: PollingEventContext<ModelType>, data: any): State<ModelType> | 'skip' {
    const pass = this.decoder(data);
    state.updateItem(pass);

    context.postDelayed(5 * 1000, (s1: State<ModelType>) => {
      s1.removeItem(pass);
      return s1;
    });

    return state;
  }
}


function makePollingEventHandler<ModelType extends BaseModel>(handlers: EventHandler<ModelType>[]): PollingEventHandler<ModelType> {
  return (state: State<ModelType>, action: PollingEventContext<ModelType>) => {

    for (const handler of handlers) {
      if (handler.matches(action.event)) {
        const result = handler.handle(state, action, action.event.data);
        if (result !== 'skip') {
          return result;
        }
      }
    }

    return state;
  };
}


export function mergeObject<T>(initial: T, updates: Observable<Partial<T>>): Observable<T> {
  // @ts-ignore
  return updates.scan((current, update) => Object.assign({}, current, update), initial);
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

    const passEvents: Observable<PollingEventContext<ModelType>> = this.polling.listen(config.eventNamespace).map(wrapPollingEvent);

    const events: Observable<Action<ModelType, ExternalEventType>> = Observable.merge(wrappedExternalEvents, passEvents,
      loopbackEvents, Observable.of<'reload'>('reload'));

    const accumulator = (state: State<ModelType>, action: Action<ModelType, ExternalEventType>) => {
      console.log('acc()', state, action);
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

  watchHallPassesFromLocation(sortingEvents: Observable<HallPassFilter>, filter: Location): Observable<HallPass[]> {

    return this.watch<HallPass, HallPassFilter>({
      externalEvents: sortingEvents,
      eventNamespace: 'hall_pass',
      initialUrl: `api/methacton/v1/hall_passes?limit=20&origin=${filter.id}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: HallPassFilter) => {
        s.sort = e.sort;
        s.filter_query = e.search_query;
        return s;
      },
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.create'], HallPass.fromJSON, (pass) => pass.origin.id === filter.id),
      ]),
      handlePost: filterHallPasses
    });
  }

  watchHallPassesToLocation(sortingEvents: Observable<HallPassFilter>, filter: Location): Observable<HallPass[]> {

    return this.watch<HallPass, HallPassFilter>({
      externalEvents: sortingEvents,
      eventNamespace: 'hall_pass',
      initialUrl: `api/methacton/v1/hall_passes?limit=20&destination=${filter.id}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: HallPassFilter) => {
        s.sort = e.sort;
        s.filter_query = e.search_query;
        return s;
      },
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.create'], HallPass.fromJSON, (pass) => pass.destination.id === filter.id),
      ]),
      handlePost: filterHallPasses
    });
  }

  watchActiveHallPasses(sortingEvents: Observable<HallPassFilter>, filter?: PassFilterType): Observable<HallPass[]> {
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

    return this.watch<HallPass, HallPassFilter>({
      externalEvents: sortingEvents,
      eventNamespace: 'hall_pass',
      initialUrl: `api/methacton/v1/hall_passes?limit=20&active=true${queryFilter}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: HallPassFilter) => {
        s.sort = e.sort;
        s.filter_query = e.search_query;
        return s;
      },
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.start'], HallPass.fromJSON, filterFunc),
        new RemoveItem(['hall_pass.end'], HallPass.fromJSON)
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
      initialUrl: `api/methacton/v1/hall_passes?limit=20&active=future${queryFilter}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.create'], HallPass.fromJSON, (pass) => filterFunc(pass) && pass.start_time > new Date()),
        new RemoveItem(['hall_pass.start'], HallPass.fromJSON)
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
      initialUrl: `api/methacton/v1/hall_passes?limit=20&active=past${queryFilter}`,
      decoder: data => HallPass.fromJSON(data),
      handleExternalEvent: (s: State<HallPass>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['hall_pass.end'], HallPass.fromJSON, filterFunc)
      ]),
      handlePost: (s: State<HallPass>) => {
        s.sort = 'start_time';
        return filterHallPasses(s);
      }
    });
  }

  watchInboxRequests(filter: User): Observable<Request[]> {
    const isStudent = filter.roles.includes('hallpass_student');

    return this.watch<Request, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'pass_request',
      initialUrl: `api/methacton/v1/inbox/${isStudent ? 'student' : 'teacher'}`,
      rawDecoder: (json) => json.pass_requests.map(d => Request.fromJSON(d)),
      decoder: data => Request.fromJSON(data),
      handleExternalEvent: (s: State<Request>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_request.create'], Request.fromJSON),
        new RemoveItem(['pass_request.deny', 'pass_request.cancel'], Request.fromJSON),
        new RemoveRequestOnApprove(['pass_request.accept'])
      ]),
      handlePost: identityFilter
    });
  }

  watchInboxInvitations(filter: User): Observable<Invitation[]> {
    const isStudent = filter.roles.includes('hallpass_student');

    return this.watch<Invitation, string>({
      externalEvents: Observable.empty(),
      eventNamespace: 'pass_invitation',
      initialUrl: `api/methacton/v1/inbox/${isStudent ? 'student' : 'teacher'}`,
      rawDecoder: (json) => json.invitations.map(d => Invitation.fromJSON(d)),
      decoder: data => Invitation.fromJSON(data),
      handleExternalEvent: (s: State<Invitation>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_invitation.create'], Invitation.fromJSON),
        new RemoveItem(['pass_invitation.deny', 'pass_invitation.cancel'], Invitation.fromJSON),
        new RemoveInvitationOnApprove(['pass_invitation.accept'])
      ]),
      handlePost: identityFilter
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
      initialUrl: `api/methacton/v1/pass_requests?limit=20&active=true${queryFilter}`,
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