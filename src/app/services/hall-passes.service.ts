import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import { Pinnable } from '../models/Pinnable';
import { HttpService } from './http-service';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {
  getCurrentPinnable,
  getIsLoadedPinnables,
  getIsLoadingPinnables,
  getPinnableCollection,
  getPinnablesIds
} from '../ngrx/pinnables/states';
import {getPinnables, postPinnables, removePinnable, updatePinnable} from '../ngrx/pinnables/actions';
import {getPassStats} from '../ngrx/pass-stats/actions';
import {getPassStatsResult} from '../ngrx/pass-stats/state/pass-stats-getters.state';

@Injectable({
  providedIn: 'root'
})
export class HallPassesService {

  pinnables$: Observable<Pinnable[]>;
  loadedPinnables$: Observable<boolean>;
  isLoadingPinnables$: Observable<boolean>;
  pinnablesCollectionIds$: Observable<number[] | string[]>;

  currentPinnable$: Observable<Pinnable>;
  passStats$;

  isOpenPassModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpService, private store: Store<AppState>) {
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

    getAggregatedPasses() {
      return this.http.get('v1/hall_passes/aggregated');
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

    createArrangedPinnable(body) {
        return this.http.post(`v1/pinnables/arranged`, body);
    }

    searchPasses(url) {
      return this.http.get(url);
    }
}

