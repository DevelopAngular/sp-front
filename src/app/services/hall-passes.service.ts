import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import { Pinnable } from '../models/Pinnable';
import { HttpService } from './http-service';
import { Store } from '@ngrx/store';
import { AppState } from '../ngrx/app-state/app-state';
import {
	getArrangedLoading,
	getCurrentPinnable,
	getIsLoadedPinnables,
	getIsLoadingPinnables,
	getPinnableCollection,
	getPinnableEntities,
	getPinnablesIds,
} from '../ngrx/pinnables/states';
import { arrangedPinnable, getPinnables, postPinnables, removePinnable, updatePinnable } from '../ngrx/pinnables/actions';
import { getPassStats } from '../ngrx/pass-stats/actions';
import { getPassStatsResult } from '../ngrx/pass-stats/state/pass-stats-getters.state';
import { bufferCount, filter, mergeMap, reduce } from 'rxjs/operators';
import { constructUrl } from '../live-data/helpers';
import { changePassesCollectionAction, endPassAction, getMorePasses, searchPasses, sortPasses } from '../ngrx/passes/actions';
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
	getStartPassLoading,
	getTotalPasses,
} from '../ngrx/passes/states';
import { HallPass } from '../models/HallPass';
import { PollingService } from './polling-service';
import { getPassFilter, updatePassFilter } from '../ngrx/pass-filters/actions';
import { getFiltersData, getFiltersDataLoading } from '../ngrx/pass-filters/states';
import { PassFilters } from '../models/PassFilters';
import { Invitation } from '../models/Invitation';
import { getInvitationsCollection } from '../ngrx/pass-like-collection/nested-states/invitations/states/invitations-getters.states';
import { filterExpiredPasses } from '../ngrx/pass-like-collection/nested-states/expired-passes/actions';
import { getLastAddedExpiredPasses } from '../ngrx/pass-like-collection/nested-states/expired-passes/states';
import { getPreviewPasses } from '../ngrx/quick-preview-passes/actions';
import {
	getQuickPreviewPassesCollection,
	getQuickPreviewPassesLoaded,
	getQuickPreviewPassesLoading,
	getQuickPreviewPassesStats,
} from '../ngrx/quick-preview-passes/states';
import { Dictionary } from '@ngrx/entity';
import { WaitingInLinePassResponse } from '../models/WaitInLine';

export interface BulkHallPassPostResponse {
	passes: HallPass[];
	conflict_student_ids: string[];
	waiting_in_line_passes: WaitingInLinePassResponse[];
}

@Injectable({
	providedIn: 'root',
})
export class HallPassesService {
	pinnables$: Observable<Pinnable[]> = this.store.select(getPinnableCollection);
	loadedPinnables$: Observable<boolean> = this.store.select(getIsLoadedPinnables);
	isLoadingPinnables$: Observable<boolean> = this.store.select(getIsLoadingPinnables);
	pinnablesCollectionIds$: Observable<number[] | string[]> = this.store.select(getPinnablesIds);
	pinnablesEntities$: Observable<Dictionary<Pinnable>> = this.store.select(getPinnableEntities);
	isLoadingArranged$: Observable<boolean> = this.store.select(getArrangedLoading);

	passesEntities$: Observable<{ [id: number]: HallPass }> = this.store.select(getPassesEntities);
	passesCollection$: Observable<HallPass[]> = this.store.select(getPassesCollection);
	passesLoaded$: Observable<boolean> = this.store.select(getPassesLoaded);
	passesLoading$: Observable<boolean> = this.store.select(getPassesLoading);
	moreLoading$: Observable<boolean> = this.store.select(getMorePassesLoading);
	sortPassesLoading$: Observable<boolean> = this.store.select(getSortPassesLoading);
	sortPassesValue$: Observable<string> = this.store.select(getSortPassesValue);
	currentPassesCount$: Observable<number> = this.store.select(getPassesTotalCount);
	currentCountPassesInPage$: Observable<number> = this.store.select(getTotalPasses);
	startPassLoading$: Observable<boolean> = this.store.select(getStartPassLoading);

	passFilters$: Observable<{ [model: string]: PassFilters }> = this.store.select(getFiltersData);
	passFiltersLoading$: Observable<boolean> = this.store.select(getFiltersDataLoading);

	passesNextUrl$: Observable<string> = this.store.select(getPassesNextUrl);

	expiredPassesNextUrl$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	lastAddedExpiredPasses$: Observable<HallPass[]> = this.store.select(getLastAddedExpiredPasses);

	invitations$: Observable<Invitation[]> = this.store.select(getInvitationsCollection);

	quickPreviewPasses$: Observable<HallPass[]> = this.store.select(getQuickPreviewPassesCollection);
	quickPreviewPassesStats$: Observable<any> = this.store.select(getQuickPreviewPassesStats);
	quickPreviewPassesLoading$: Observable<boolean> = this.store.select(getQuickPreviewPassesLoading);
	quickPreviewPassesLoaded$: Observable<boolean> = this.store.select(getQuickPreviewPassesLoaded);

	currentPinnable$: Observable<Pinnable> = this.store.select(getCurrentPinnable);
	passStats$ = this.store.select(getPassStatsResult);

	isOpenPassModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	createPassEvent$: Subject<any> = new Subject<any>();

	constructor(private http: HttpService, private store: Store<AppState>, private pollingService: PollingService) {}

	getActivePasses() {
		return this.http.get('v1/hall_passes?active=true');
	}

	getAggregatedPasses(locationsIds: number[] | string[]) {
		return from(locationsIds).pipe(
			bufferCount(20),
			mergeMap((ids) => {
				const url = constructUrl('v1/hall_passes/aggregated', {
					location: ids,
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

	createPass(data, future: boolean = false) {
		return this.http.post(`v1/hall_passes`, data);
	}

	// response is a Partial since depending on when the route is called, the backend can
	// return at least one of the possible keys
	bulkCreatePass(data, future: boolean = false): Observable<Partial<BulkHallPassPostResponse>> {
		return this.http.post(`v1/hall_passes`, data);
	}

	hidePasses(data) {
		return this.http.patch('v1/hall_passes/hide', data);
	}

	cancelPass(id, data) {
		return this.http.post(`v1/hall_passes/${id}/cancel`, data);
	}

	endPassRequest(passId) {
		return this.store.dispatch(endPassAction({ passId }));
	}

	endPass(id) {
		return this.http.post(`v1/hall_passes/${id}/ended`);
	}

	endPassWithCheckIn(id, data) {
		return this.http.post(`v1/hall_passes/${id}/ended`, data);
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
		this.store.dispatch(postPinnables({ data }));
		return this.store.select(getCurrentPinnable).pipe(
			filter((p) => {
				if (!p) {
					return true;
				}
				return data.title === p.title;
			})
		);
	}

	createPinnable(data) {
		return this.http.post('v1/pinnables', data);
	}

	updatePinnableRequest(id, pinnable) {
		this.store.dispatch(updatePinnable({ id, pinnable }));
		return this.currentPinnable$;
	}

	updatePinnable(id, data) {
		return this.http.patch(`v1/pinnables/${id}`, data);
	}

	deletePinnableRequest(id, add_to_folder: boolean = false) {
		this.store.dispatch(removePinnable({ id, add_to_folder } as any));
		return of(true);
	}

	deletePinnable(id, add_to_folder: boolean = false) {
		return this.http.delete(`v1/pinnables/${id}?add_to_folder=${add_to_folder}`);
	}

	checkPinnableName(value) {
		return this.http.get(`v1/pinnables/check_fields?title=${value}`);
	}

	getArrangedPinnables() {
		return this.http.get('v1/pinnables?arranged=true');
	}

	createArrangedPinnableRequest(order) {
		this.store.dispatch(arrangedPinnable({ order }));
		return of(null);
	}

	createArrangedPinnable(body) {
		return this.http.post(`v1/pinnables/arranged`, body);
	}

	searchPassesRequest(url: string) {
		this.store.dispatch(searchPasses({ url }));
	}

	searchPasses(url) {
		return this.http.get(url);
	}

	getMorePasses() {
		this.store.dispatch(getMorePasses());
	}

	sortHallPassesRequest(queryParams) {
		this.store.dispatch(sortPasses({ queryParams }));
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
		this.store.dispatch(getPassFilter({ model }));
	}

	getFilters(model: string) {
		return this.http.get(`v1/filters/${model}`);
	}

	updateFilterRequest(model, value) {
		this.store.dispatch(updatePassFilter({ model, value }));
	}

	updateFilter(model: string, value: string) {
		return this.http.patch(`v1/filters/${model}`, { default_time_filter: value });
	}

	filterExpiredPassesRequest(user, timeFilter) {
		this.store.dispatch(filterExpiredPasses({ user, timeFilter }));
	}

	getQuickPreviewPassesRequest(userId, pastPasses) {
		this.store.dispatch(getPreviewPasses({ userId, pastPasses }));
	}

	getQuickPreviewPasses(userId, pastPasses) {
		return this.http.get(`v1/users/${userId}/hall_pass_stats?recent_past_passes=${pastPasses}&limit=50`);
	}

	changePassesCollection(passIds: number[]) {
		this.store.dispatch(changePassesCollectionAction({ passIds }));
	}
}
