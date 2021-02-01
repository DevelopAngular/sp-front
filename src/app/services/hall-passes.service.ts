import {Injectable} from '@angular/core';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {Pinnable} from '../models/Pinnable';
import {HttpService} from './http-service';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {
  getArrangedLoading,
  getCurrentPinnable,
  getIsLoadedPinnables,
  getIsLoadingPinnables,
  getPinnableCollection,
  getPinnablesIds
} from '../ngrx/pinnables/states';
import {arrangedPinnable, getPinnables, postPinnables, removePinnable, updatePinnable} from '../ngrx/pinnables/actions';
import {getPassStats} from '../ngrx/pass-stats/actions';
import {getPassStatsResult} from '../ngrx/pass-stats/state/pass-stats-getters.state';
import {bufferCount, mergeMap, reduce} from 'rxjs/operators';
import {constructUrl} from '../live-data/helpers';
import {getMorePasses, searchPasses, sortPasses} from '../ngrx/passes/actions';
import {
  getMorePassesLoading,
  getPassesCollection,
  getPassesEntities,
  getPassesLoaded,
  getPassesLoading,
  getPassesNextUrl,
  getPassesTotalCount,
  getSortPassesLoading,
  getSortPassesValue,
  getTotalPasses
} from '../ngrx/passes/states';
import {HallPass} from '../models/HallPass';
import {PollingService} from './polling-service';
import {getPassFilter, updatePassFilter} from '../ngrx/pass-filters/actions';
import {getFiltersData, getFiltersDataLoading} from '../ngrx/pass-filters/states';
import {PassFilters} from '../models/PassFilters';
import {Invitation} from '../models/Invitation';
import {getInvitationsCollection} from '../ngrx/pass-like-collection/nested-states/invitations/states/invitations-getters.states';
import {filterExpiredPasses, getMoreExpiredPasses} from '../ngrx/pass-like-collection/nested-states/expired-passes/actions';
import {getLastAddedExpiredPasses} from '../ngrx/pass-like-collection/nested-states/expired-passes/states';

@Injectable({
  providedIn: 'root'
})
export class HallPassesService {

  pinnables$: Observable<Pinnable[]>;
  loadedPinnables$: Observable<boolean>;
  isLoadingPinnables$: Observable<boolean>;
  pinnablesCollectionIds$: Observable<number[] | string[]>;
  isLoadingArranged$: Observable<boolean> = this.store.select(getArrangedLoading);

  passesEntities$: Observable<{[id: number]: HallPass}> = this.store.select(getPassesEntities);
  passesCollection$: Observable<HallPass[]> = this.store.select(getPassesCollection);
  passesLoaded$: Observable<boolean> = this.store.select(getPassesLoaded);
  passesLoading$: Observable<boolean> = this.store.select(getPassesLoading);
  moreLoading$: Observable<boolean> = this.store.select(getMorePassesLoading);
  sortPassesLoading$: Observable<boolean> = this.store.select(getSortPassesLoading);
  sortPassesValue$: Observable<string> = this.store.select(getSortPassesValue);
  currentPassesCount$: Observable<number> = this.store.select(getPassesTotalCount);
  currentCountPassesInPage$: Observable<number> = this.store.select(getTotalPasses);

  passFilters$: Observable<{[model: string]: PassFilters}> = this.store.select(getFiltersData);
  passFiltersLoading$: Observable<boolean> = this.store.select(getFiltersDataLoading);

  passesNextUrl$: Observable<string> = this.store.select(getPassesNextUrl);

  expiredPassesNextUrl$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  lastAddedExpiredPasses$: Observable<HallPass[]> = this.store.select(getLastAddedExpiredPasses);

  invitations$: Observable<Invitation[]> = this.store.select(getInvitationsCollection);

  currentPinnable$: Observable<Pinnable>;
  passStats$;

  isOpenPassModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private http: HttpService,
    private store: Store<AppState>,
    private pollingService: PollingService
  ) {
    this.pinnables$ = this.store.select(getPinnableCollection);
    this.loadedPinnables$ = this.store.select(getIsLoadedPinnables);
    this.isLoadingPinnables$ = this.store.select(getIsLoadingPinnables);
    this.currentPinnable$ = this.store.select(getCurrentPinnable);
    this.passStats$ = this.store.select(getPassStatsResult);
    this.pinnablesCollectionIds$ = this.store.select(getPinnablesIds);
  }

    getActivePasses() {
        return this.http.get('v1/hall_passes?active=true');
    }

    getAggregatedPasses(locationsIds: number[] | string[]) {
      return from(locationsIds)
        .pipe(
          bufferCount(20),
          mergeMap(ids => {
            const url = constructUrl('v1/hall_passes/aggregated', {
              location: ids
            });
            return this.http.get(url);
          }),
          reduce((acc, curr) => acc.concat(curr), [])
        );
      // return this.http.get('v1/hall_passes/aggregated');
    }

    getActivePassesKioskMode(locId) {
      return this.http.get(`v1/hall_passes?active=true&location=${locId}`);
    }

    createPass(data) {
        return this.http.post(`v1/hall_passes`, data);
    }

    bulkCreatePass(data) {
        return this.http.post('v1/hall_passes/bulk_create', data);
    }

    cancelPass(id, data) {
        return this.http.post(`v1/hall_passes/${id}/cancel`, data);
    }

    endPass(id) {
        return this.http.post(`v1/hall_passes/${id}/ended`);
    }

    getPassStatsRequest() {
      this.store.dispatch(getPassStats());
      return this.passStats$;
    }

    getPassStats() {
        return this.http.get('v1/hall_passes/stats');
    }

    getPinnables(): Observable<Pinnable[]> {
        return this.http.get('v1/pinnables/arranged');
    }

    getPinnablesRequest() {
      this.store.dispatch(getPinnables());
      return this.pinnables$;
    }

    postPinnableRequest(data) {
      this.store.dispatch(postPinnables({data}));
      return this.currentPinnable$;
    }

    createPinnable(data) {
        return this.http.post('v1/pinnables', data);
    }

    updatePinnableRequest(id, pinnable) {
      this.store.dispatch(updatePinnable({id, pinnable}));
      return this.currentPinnable$;
    }

    updatePinnable(id, data) {
        return this.http.patch(`v1/pinnables/${id}`, data);
    }

    deletePinnableRequest(id) {
      this.store.dispatch(removePinnable({id}));
      return of(true);
    }

    deletePinnable(id) {
        return this.http.delete(`v1/pinnables/${id}`);
    }

    checkPinnableName(value) {
        return this.http.get(`v1/pinnables/check_fields?title=${value}`);
    }

    getArrangedPinnables() {
        return this.http.get('v1/pinnables?arranged=true');
    }

  createArrangedPinnableRequest(order) {
    this.store.dispatch(arrangedPinnable({order}));
    return of(null);
  }

  createArrangedPinnable(body) {
      return this.http.post(`v1/pinnables/arranged`, body);
  }

  searchPassesRequest(url: string) {
    this.store.dispatch(searchPasses({url}));
  }

  searchPasses(url) {
    return this.http.get(url);
  }

  getMorePasses() {
    this.store.dispatch(getMorePasses());
  }

  sortHallPassesRequest(queryParams) {
    this.store.dispatch(sortPasses({queryParams}));
  }

  sortHallPasses(queryParams) {
    return this.http.get(constructUrl('v1/hall_passes', queryParams));
  }

  startPushNotification() {
    return this.http.post('v1/users/@me/test_push_message', new Date());
  }

  watchPassStart() {
    return this.pollingService.listen('message.alert');
  }

  watchEndPass() {
    return this.pollingService.listen('hall_pass.end');
  }

  getFiltersRequest(model: string) {
    this.store.dispatch(getPassFilter({model}));
  }

  getFilters(model: string) {
    return this.http.get(`v1/filters/${model}`);
  }

  updateFilterRequest(model, value) {
    this.store.dispatch(updatePassFilter({model, value}));
  }

  updateFilter(model: string, value: string) {
    return this.http.patch(`v1/filters/${model}`, {default_time_filter: value});
  }

  getMoreExpiredPassesRequest(user, timeFilter = null, offset = null) {
    this.store.dispatch(getMoreExpiredPasses({user, timeFilter, offset}));
  }

  getMoreExpiredPasses(timeFilter) {
    if (timeFilter) {
      return this.http.get(this.expiredPassesNextUrl$.getValue() + `&model_filter=expired-passes&time-filter=${timeFilter}`);
    }
    return this.http.get(this.expiredPassesNextUrl$.getValue());
  }

  filterExpiredPassesRequest(user, timeFilter) {
    this.store.dispatch(filterExpiredPasses({user, timeFilter}));
  }

  filterExpiredPasses(timeFilter) {
    return this.http.get(this.expiredPassesNextUrl$.getValue())
  }
}

