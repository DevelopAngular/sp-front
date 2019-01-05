import { Injectable } from '@angular/core';

import { combineLatest, empty, merge, of } from 'rxjs';
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
import {
  AddItem,
  makePollingEventHandler,
  RemoveInvitationOnApprove,
  RemoveItem,
  RemoveRequestOnApprove,
  UpdateItem
} from './polling-event-handlers';
import { State } from './state';


interface WatchData<ModelType extends BaseModel, ExternalEventType> {
  /**
   * An observable of events that are external to the websocket connection.
   * Typically these events will be triggered by UI actions such as changing
   * the sort order or changing filter settings.
   */
  externalEvents: Observable<ExternalEventType>;

  /**
   * Not currently used. Please set this to the closest websocket namespace that
   * matches the events you care about. For example, if your PollingEventHandler
   * uses `hall_pass.create` and `hall_pass.update`, this should be `hall_pass`.
   */
  eventNamespace: string;

  /**
   * The url to load the initial items of this data watch. Typically this will be
   * a GET request with the filters encoded as query parameters.
   */
  initialUrl: string;

  /**
   * Decode the raw JSON response into an array of initial items of ModelType.
   * This parameter handles the raw response which is often not necessary.
   *
   * @param any Decoded JSON response from the initialUrl request.
   */
  rawDecoder?: (any) => ModelType[];

  /**
   * If the initialUrl call returns a Paged<...> response, watch() handles
   * this and will call this decoder on each object of the result. Most model
   * types have a fromJSON method which is often used as the decoder.
   *
   * @param any A JSON object to be decoded.
   */
  decoder: (any) => ModelType;

  /**
   * When an external event is received, this function gets called with the
   * current state and the external event. It must return a new state, but
   * the new state could be the same state that was passed in or a changed
   * version of the passed in state.
   *
   * A typical usage might be to update flags on the State object regarding
   * sort order. In general sorting and filtering of the items should not
   * happen in this function. It should be done in handlePost().
   */
  handleExternalEvent: (state: State<ModelType>, e: ExternalEventType) => State<ModelType>;

  /**
   * When an event from the websocket is received, this function gets called
   * with the current state and the PollingEventContext. It must return a new
   * state, but the new state could be the same state that was passed in or
   * a changed version of the passed in state.
   *
   * A typical usage might be to insert new items, remove deleted ones, and
   * update any items already held by the State object when their websocket
   * events occur. In general sorting and filtering of the items should not
   * happen in this function. It should be done in handlePost().
   */
  handlePollingEvent: PollingEventHandler<ModelType>;

  /**
   * Called after any events are processed to sort and filter items. The
   * main purpose of this function is to somehow set the State object's
   * `filtered_passes` field. Simple implementations might perform
   * `state.filtered_passes = state.passes;` but often more complex filtering
   * and sorting is required.
   *
   * @param state
   */
  handlePost: (state: State<ModelType>) => State<ModelType>;
}

/**
 * For a given date, return the Date objects corresponding to the
 * previous midnight and the next midnight.
 *
 * @param date
 */
function getDateLimits(date: Date) {
  const start = new Date(+date);

  start.setHours(0, 0, 0, 0);

  const end = new Date((+date) + 24 * 60 * 60 * 1000);

  return {start, end};
}

/**
 * Given an object, returns whether it should be included.
 */
type FilterFunc<T> = (item: T) => boolean;

/**
 * Takes a list of filters and `&&` (ANDs) them together. If one filter
 * rejects an item, the returned filter will too.
 *
 * @param filters An array of filters.
 * @return A filter function
 */
function mergeFilters<T>(filters: FilterFunc<T>[]): FilterFunc<T> {
  return (item: T) => {
    for (const filter of filters) {
      if (!filter(item)) {
        return false;
      }
    }

    return true;
  };
}

/**
 * Types of filters for hall passes.
 */
export type PassFilterType = { type: 'issuer', value: User } | { type: 'student', value: User } | { type: 'location', value: Location };

export type RequestFilterType =
  { type: 'issuer', value: User }
  | { type: 'student', value: User }
  | { type: 'destination', value: Location };

/**
 * An interface representing how hall passes should be filtered.
 */
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

    // Wrap external events in an object so that we can distinguish event types after they are merged.
    const wrappedExternalEvents: Observable<ExternalEvent<ExternalEventType>> = config.externalEvents
      .map(event => (<ExternalEvent<ExternalEventType>>{type: 'external-event', event: event}));

    // A subject for loopback events. These are events usually triggered by the postDelayed() function after a delay.
    const loopbackEvents = new Subject<TransformFunc<ModelType>>();

    /**
     * A function to register a state transformation function to run after a period of time.
     * A typical use might be that an item is marked "deleted" if a delete event is received and
     *  the deletion is indicated visually somehow. Then, the item is removed altogether after a
     * short period of time by a transformation function given here.
     *
     * @see RemoveItemWithDelay
     */
    function postDelayed(ms: number, func: (s: State<ModelType>) => State<ModelType>) {
      setTimeout(() => {
        loopbackEvents.next({type: 'transform-func', func: func});
      }, ms);
    }

    // Wrap polling events and provide the postDelayed function so that future events can be scheduled.
    function wrapPollingEvent(event: PollingEvent): PollingEventContext<ModelType> {
      return {
        type: 'polling-event',
        event: event,
        postDelayed: postDelayed
      };
    }

    const passEvents: Observable<PollingEventContext<ModelType>> = this.polling.listen().map(wrapPollingEvent);

    /* A merged observable of all event sources and an initial event 'reload' that is
     * used to run the accumulator() function and thereby set `filtered_passes`.
     */
    const events: Observable<Action<ModelType, ExternalEventType>> = merge(wrappedExternalEvents, passEvents,
      loopbackEvents, of<'reload'>('reload'));

    /**
     * Takes a current state and an event, deduces the type of event, calls the appropriate
     * handler, then calls handlePost() to set `filtered_passes`.
     *
     * @param state The current state
     * @param action The event to handle.
     * @return A new (or modified) state.
     */
    const accumulator = (state: State<ModelType>, action: Action<ModelType, ExternalEventType>) => {
      if (action === 'reload') {
        // do nothing, but handlePost() still runs.
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

    /**
     * Calls the initialUrl, decodes the result into items, then uses RxJS scan()
     * to handle each event and keep track of the current state.
     *
     * The State object's `filtered_passes` is returned.
     */
    return this.http.get<Paged<any>>(config.initialUrl)
      .pipe(
        map(rawDecoder),
        switchMap(items => events.scan<Action<ModelType, ExternalEventType>, State<ModelType>>(accumulator, new State(items))),
        map(state => state.filtered_passes)
      );
  }

  getDateRange(date: Date) {
    return getDateLimits(date);
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
      externalEvents: empty(),
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
      externalEvents: empty(),
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

    const denyHandler = isStudent
      ? new AddItem(['pass_request.deny'], Request.fromJSON)
      : new RemoveItem(['pass_request.deny'], Request.fromJSON);

    return this.watch<Request, string>({
      externalEvents: empty(),
      eventNamespace: 'pass_request',
      initialUrl: `v1/inbox/${isStudent ? 'student' : 'teacher'}`,
      rawDecoder: (json) => json.pass_requests.map(d => Request.fromJSON(d)),
      decoder: data => Request.fromJSON(data),
      handleExternalEvent: (s: State<Request>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_request.create'], Request.fromJSON),
        new UpdateItem(['pass_request.update'], Request.fromJSON),
        new RemoveItem(['pass_request.cancel'], Request.fromJSON),
        new RemoveRequestOnApprove(['pass_request.accept']),
        denyHandler,
      ]),
      handlePost: filterNewestFirst
    });
  }

  watchInboxInvitations(filter: User): Observable<Invitation[]> {
    const isStudent = filter.roles.includes('hallpass_student');

    const denyHandler = isStudent
      ? new RemoveItem(['pass_request.deny'], Invitation.fromJSON)
      : new AddItem(['pass_request.deny'], Invitation.fromJSON);

    return this.watch<Invitation, string>({
      externalEvents: empty(),
      eventNamespace: 'pass_invitation',
      initialUrl: `v1/inbox/${isStudent ? 'student' : 'teacher'}`,
      rawDecoder: (json) => json.invitations.map(d => Invitation.fromJSON(d)),
      decoder: data => Invitation.fromJSON(data),
      handleExternalEvent: (s: State<Invitation>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_invitation.create'], Invitation.fromJSON),
        new UpdateItem(['pass_invitation.update'], Invitation.fromJSON),
        new RemoveItem(['pass_invitation.cancel'], Invitation.fromJSON),
        new RemoveInvitationOnApprove(['pass_invitation.accept']),
        denyHandler,
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
      externalEvents: empty(),
      eventNamespace: 'pass_request',
      initialUrl: `v1/pass_requests?limit=20&active=true${queryFilter}`,
      decoder: data => Request.fromJSON(data),
      handleExternalEvent: (s: State<Request>, e: string) => s,
      handlePollingEvent: makePollingEventHandler([
        new AddItem(['pass_request.create'], Request.fromJSON, filterFunc),
        new RemoveItem(['pass_request.cancel'], Request.fromJSON),
        new RemoveRequestOnApprove(['pass_request.accept']),
        new UpdateItem(['pass_request.deny'], Request.fromJSON)
      ]),
      handlePost: identityFilter
    });
  }

  watchActivePassLike(student: User): Observable<PassLike> {

    const passes$ = this.watchActiveHallPasses(empty(), {type: 'student', value: student});
    const requests$ = this.watchActiveRequests(student).pipe(map(requests => {
      return requests.filter(req => !req.request_time);
    }));

    const merged$ = combineLatest(
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
