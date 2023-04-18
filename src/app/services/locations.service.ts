import { Injectable } from '@angular/core';
import { bufferCount, flatMap, reduce, take } from 'rxjs/operators';
import { constructUrl } from '../live-data/helpers';
import { Paged } from '../models';
import { HttpService } from './http-service';
import { User } from '../models/User';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Location } from '../models/Location';
import { Pinnable } from '../models/Pinnable';
import { Store } from '@ngrx/store';
import { AppState } from '../ngrx/app-state/app-state';
import { getTeacherLocationsCollection } from '../ngrx/teacherLocations/state/locations-getters.state';
import { getLocsWithTeachers } from '../ngrx/teacherLocations/actions';
import {
	getCreatedLocation,
	getFoundLocations,
	getLoadedLocations,
	getLoadingLocations,
	getLocationsCollection,
	getLocationsFromCategoryGetter,
	getUpdatedLocation,
} from '../ngrx/locations/states/locations-getters.state';
import {
	getLocations,
	getLocationsFromCategory,
	postLocation,
	removeLocation,
	searchLocations,
	updateLocation,
	updateLocationSuccess,
} from '../ngrx/locations/actions';
import { updatePinnableSuccess } from '../ngrx/pinnables/actions';
import {
	getFavoriteLocationsCollection,
	getLoadedFavoriteLocations,
	getLoadingFavoriteLocations,
} from '../ngrx/favorite-locations/states/favorite-locations-getters.state';
import { getFavoriteLocations, updateFavoriteLocations } from '../ngrx/favorite-locations/actions';
import { PassLimit } from '../models/PassLimit';
import { getPassLimitCollection, getPassLimitEntities } from '../ngrx/pass-limits/states';
import { getPassLimits, updatePassLimit } from '../ngrx/pass-limits/actions';
import { PollingEvent, PollingService } from './polling-service';
import { FeatureFlagService, FLAGS } from './feature-flag.service';
import { PassLimitDialogComponent } from '../create-hallpass-forms/main-hallpass--form/locations-group-container/pass-limit-dialog/pass-limit-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
	providedIn: 'root',
})
export class LocationsService {
	locations$: Observable<Location[]> = this.store.select(getLocationsCollection);
	createdLocation$: Observable<Location> = this.store.select(getCreatedLocation);
	updatedLocation$: Observable<Location> = this.store.select(getUpdatedLocation);
	loadingLocations$: Observable<boolean> = this.store.select(getLoadingLocations);
	loadedLocations$: Observable<boolean> = this.store.select(getLoadedLocations);
	pass_limits$: Observable<PassLimit[]> = this.store.select(getPassLimitCollection);
	pass_limits_entities$: Observable<{ [id: number]: PassLimit }> = this.store.select(getPassLimitEntities);

	foundLocations$: Observable<Location[]> = this.store.select(getFoundLocations);
	locsFromCategory$: Observable<Location[]> = this.store.select(getLocationsFromCategoryGetter);

	favoriteLocations$: Observable<Location[]> = this.store.select(getFavoriteLocationsCollection);
	loadingFavoriteLocations$: Observable<boolean> = this.store.select(getLoadingFavoriteLocations);
	loadedFavoriteLocations$: Observable<boolean> = this.store.select(getLoadedFavoriteLocations);

	teacherLocations$: Observable<Location[]> = this.store.select(getTeacherLocationsCollection);

	myRoomSelectedLocation$: BehaviorSubject<Location> = new BehaviorSubject(null);

	focused: BehaviorSubject<boolean> = new BehaviorSubject(true);

	constructor(
		private http: HttpService,
		private store: Store<AppState>,
		private pollingService: PollingService,
		private featureFlags: FeatureFlagService,
		private dialog: MatDialog
	) {}

	// TODO: Convert params of function into an object
	getLocationsWithCategory(category: string, show_removed: boolean = false): Observable<Location[]> {
		return this.http.get('v1/locations', {
			params: {
				category: category,
				show_removed,
			},
		});
	}

	getLocationsWithTeacherRequest(teacher: User): Observable<Location[]> {
		this.store.dispatch(getLocsWithTeachers({ teacher }));
		return this.teacherLocations$;
	}

	getLocationsWithTeacher(teacher: User): Observable<Location[]> {
		return this.http.get<any[]>(`v1/locations?teacher_id=${teacher.id}`);
	}

	getLocationsWithManyTeachers(teachers: User[]): Observable<Location[]> {
		const teacherIds = teachers.map((t) => t.id);
		return from(teacherIds).pipe(
			bufferCount(20),
			flatMap((ids) => {
				const url = constructUrl('v1/locations', {
					teacher_id: ids,
				});
				return this.http.get<Location[]>(url);
			}),
			reduce((acc, arr) => acc.concat(arr), [])
		);
	}

	getLocation(id): Observable<Location> {
		return this.http.get(`v1/locations/${id}`);
	}

	createLocationRequest(data): Observable<Location> {
		this.store.dispatch(postLocation({ data }));
		return this.createdLocation$;
	}

	createLocation(data): Observable<Location> {
		return this.http.post('v1/locations', data);
	}

	updateLocationRequest(id, data): Observable<Location> {
		this.store.dispatch(updateLocation({ id, data }));
		return this.updatedLocation$;
	}

	updateLocation(id, data): Observable<Location> {
		return this.http.patch(`v1/locations/${id}`, data);
	}

	deleteLocationRequest(id): Observable<boolean> {
		this.store.dispatch(removeLocation({ id }));
		return of(true);
	}

	deleteLocation(id): Observable<Location> {
		return this.http.delete(`v1/locations/${id}`);
	}

	searchLocationsRequest(url): Observable<Location[]> {
		this.store.dispatch(searchLocations({ url }));
		return this.foundLocations$;
	}

	getLocationsFromCategory(category): Observable<Location[]> {
		this.store.dispatch(getLocationsFromCategory({ category }));
		return this.locsFromCategory$;
	}

	getLocationsWithConfigRequest(url): Observable<Location[]> {
		this.store.dispatch(getLocations({ url }));
		return this.locations$;
	}

	getLocationsWithConfig(url): Observable<Location[]> {
		return this.http.get<Location[]>(url);
	}

	searchLocations(limit = 10, config = ''): Observable<Paged<Location[]>> {
		return this.http.get<Paged<Location[]>>(`v1/locations?limit=${limit}${config}`);
	}

	getLocationsWithFolder(): Observable<Location[]> {
		return this.http.get('v1/locations/categorized');
	}

	checkLocationName(value) {
		return this.http.get(`v1/locations/check_fields?title=${value}`);
	}

	checkLocationNumber(value) {
		return this.http.get(`v1/locations/check_fields?room=${value}`);
	}

	getPassLimit() {
		return this.http.get<{ pass_limits: PassLimit[] }>('v1/locations/pass_limits');
	}

	getPassLimitRequest() {
		this.store.dispatch(getPassLimits());
	}

	updatePassLimitRequest(item) {
		this.store.dispatch(updatePassLimit({ item }));
	}

	listenPassLimitSocket(): Observable<PollingEvent> {
		this.pollingService.sendMessage('location.active_pass_counts.enable', null);
		return this.pollingService.listen('location.active_pass_counts');
	}

	updateLocationSuccessState(location: Location): void {
		this.store.dispatch(updateLocationSuccess({ location }));
	}

	updatePinnableSuccessState(pinnable: Pinnable) {
		this.store.dispatch(updatePinnableSuccess({ pinnable }));
	}

	listenLocationSocket(): Observable<PollingEvent> {
		return this.pollingService.listen('location.patched');
	}

	listenPinnableSocket(): Observable<PollingEvent> {
		return this.pollingService.listen('pinnable.patched');
	}

	/////// Favorite Locations
	public getFavoriteLocationsRequest(): Observable<Location[]> {
		this.store.dispatch(getFavoriteLocations());
		return this.favoriteLocations$;
	}

	getFavoriteLocations(): Observable<Location[]> {
		return this.http.get('v1/users/@me/starred');
	}

	public updateFavoriteLocationsRequest(locations: Location[]): void {
		this.store.dispatch(updateFavoriteLocations({ locations }));
	}

	updateFavoriteLocations(body): Observable<number[]> {
		return this.http.put('v1/users/@me/starred', body);
	}

	/**
	 * This function checks if a user is allowed to create passes into a destination.
	 * @param location The pass destination that is being checked for overrides
	 * @param isKioskMode true if kiosk mode, false otherwise
	 * @param studentCount The number of passes being made into location
	 * @param skipLine true if we're overriding a Wait in Line queue. False/undefined otherwise
	 * @return {Promise<boolean>} A promise containing whether the user can create passes into the destination.
	 * Returns Promise<false> if the location limit isn't being overridden.
	 * A return value of Promise<true> means that we are allowed to create passes into the destination. This happens
	 * under the following circumstances:
	 * - The destination doesn't have a pass limit
	 * - The destination's pass limit isn't reached
	 * - Wait in Line is enabled, one student is selected and a teacher is not skipping the line
	 * - The room limit is reached and the user confirms that they wish to override the room limit
	 */
	async checkIfFullRoom(location: Location, isKioskMode: boolean, studentCount: number, skipLine?: boolean): Promise<boolean> {
		if (isKioskMode) {
			return true;
		}

		const allPassLimits = (await this.getPassLimit().pipe(take(1)).toPromise()).pass_limits;
		const passLimit = allPassLimits.find((pl) => pl.id == location.id);
		console.log(passLimit);

		if (!passLimit) {
			// passLimits has no location.id
			return true;
		}

		if (!passLimit.max_passes_to_active) {
			return true;
		}

		const passLimitReached = passLimit.to_count + studentCount > passLimit.max_passes_to;
		if (!passLimitReached) {
			return true;
		}

		// room pass limit has been reached on the teacher's side
		if (this.featureFlags.isFeatureEnabled(FLAGS.WaitInLine)) {
			const multipleStudents = studentCount > 1; // more than one student has been selected
			if (!multipleStudents && !skipLine) {
				return true;
			}
		}

		const dialogRef = this.dialog.open(PassLimitDialogComponent, {
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-backdrop',
			width: '450px',
			disableClose: true,
			data: {
				passLimit: passLimit.max_passes_to,
				studentCount: studentCount,
				currentCount: passLimit.to_count,
				isWaitInLine: this.featureFlags.isFeatureEnabled(FLAGS.WaitInLine) && skipLine,
			},
		});

		const result: { override: boolean } = await dialogRef.afterClosed().toPromise();
		return result.override;
	}

	reachedRoomPassLimit(currentPage: 'from' | 'to', passLimit: PassLimit, isStaff?: boolean): boolean {
		if (!passLimit) {
			return false;
		}

		const { max_passes_to, max_passes_to_active, to_count } = passLimit;
		if (currentPage === 'to' && !isStaff) {
			if (!max_passes_to_active) {
				// room has no pass limits
				return false;
			}

			return to_count >= max_passes_to;
		}

		return false;
	}

	tooltipDescription(currentPage: 'from' | 'to', passLimit: PassLimit): string {
		if (
			[
				!passLimit,
				currentPage === 'from',
				!this.http.getSchool().show_active_passes_number,
				!passLimit.max_passes_to_active,
				passLimit.to_count <= passLimit.max_passes_to,
			].every(Boolean)
		) {
			return '';
		}

		return `${passLimit.to_count}/${passLimit.max_passes_to} students have passes to this room.`;
	}
}
