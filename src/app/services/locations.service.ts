import { Injectable } from '@angular/core';
import { bufferCount, flatMap, reduce } from 'rxjs/operators';
import { constructUrl } from '../live-data/helpers';
import { Paged } from '../models';
import { HttpService } from './http-service';
import { User } from '../models/User';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import { Location } from '../models/Location';
import { Store } from '@ngrx/store';
import { AppState } from '../ngrx/app-state/app-state';
import { getTeacherLocationsCollection } from '../ngrx/teacherLocations/state/locations-getters.state';
import { getLocsWithTeachers } from '../ngrx/teacherLocations/actions';
import {
  getCurrentLocation,
  getFoundLocations,
  getLoadedLocations,
  getLoadingLocations,
  getLocationsCollection
} from '../ngrx/locations/states/locations-getters.state';
import {getLocations, postLocation, updateLocation, searchLocations, removeLocation} from '../ngrx/locations/actions';
import {
  getFavoriteLocationsCollection, getLoadedFavoriteLocations,
  getLoadingFavoriteLocations
} from '../ngrx/favorite-locations/states/favorite-locations-getters.state';
import {getFavoriteLocations} from '../ngrx/favorite-locations/actions';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  locations$: Observable<Location[]> = this.store.select(getLocationsCollection);
  currentLocation$: Observable<Location> = this.store.select(getCurrentLocation);
  loadingLocations$: Observable<boolean> = this.store.select(getLoadingLocations);
  loadedLocations$: Observable<boolean> = this.store.select(getLoadedLocations);

  foundLocations$: Observable<Location[]> = this.store.select(getFoundLocations);

  favoriteLocations$: Observable<Location[]> = this.store.select(getFavoriteLocationsCollection);
  loadingFavoriteLocations$: Observable<boolean> = this.store.select(getLoadingFavoriteLocations);
  loadedFavoriteLocations$: Observable<boolean> = this.store.select(getLoadedFavoriteLocations);

  teacherLocations$: Observable<Location[]> = this.store.select(getTeacherLocationsCollection);

  myRoomSelectedLocation$: BehaviorSubject<Location> = new BehaviorSubject(null);

  focused: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(private http: HttpService, private store: Store<AppState>) { }

    getLocationsWithCategory(category: string) {
        return this.http.get(`v1/locations?category=${category}&`);
    }

    getLocationsWithTeacherRequest(teacher: User): Observable<Location[]> {
      this.store.dispatch(getLocsWithTeachers({teacher}));
      return this.teacherLocations$;
    }

    getLocationsWithTeacher(teacher: User) {
        return this.http.get<any[]>(`v1/locations?teacher_id=${teacher.id}`);
    }

    getLocationsWithManyTeachers(teachers: User[]): Observable<Location[]> {
        const teacherIds = teachers.map(t => t.id);
        return from(teacherIds).pipe(
          bufferCount(20),
          flatMap(ids => {
            const url = constructUrl('v1/locations', {
              teacher_id: ids,
            });

            return this.http.get<Location[]>(url);
          }),
          reduce((acc, arr) => acc.concat(arr), [])
        );
    }

    getLocation(id) {
        return this.http.get(`v1/locations/${id}`);
    }

    createLocationRequest(data) {
      this.store.dispatch(postLocation({data}));
      return this.currentLocation$;
    }

    createLocation(data) {
        return this.http.post('v1/locations', data);
    }

    updateLocationRequest(id, data) {
      this.store.dispatch(updateLocation({id, data}));
      return this.currentLocation$;
    }

    updateLocation(id, data) {
      return this.http.patch(`v1/locations/${id}`, data);
    }

    deleteLocationRequest(id) {
      this.store.dispatch(removeLocation({id}));
      return of(true);
    }

    deleteLocation(id) {
        return this.http.delete(`v1/locations/${id}`);
    }

    searchLocationsRequest(url) {
      this.store.dispatch(searchLocations({url}));
      return this.foundLocations$;
    }

    getLocationsWithConfigRequest(url) {
      this.store.dispatch(getLocations({url}));
      return this.locations$;
    }

    getLocationsWithConfig(url) {
        return this.http.get<Location[]>(url);
    }

    searchLocations(limit = 10, config = '') {
        return this.http.get<Paged<any>>(`v1/locations?limit=${limit}${config}`);
    }

    getLocationsWithFolder() {
      return this.http.get('v1/locations/categorized');
    }

    checkLocationName(value) {
        return this.http.get(`v1/locations/check_fields?title=${value}`);
    }

    checkLocationNumber(value) {
        return this.http.get(`v1/locations/check_fields?room=${value}`);
    }

    /////// Favorite Locations
    getFavoriteLocationsRequest() {
      this.store.dispatch(getFavoriteLocations());
      return this.favoriteLocations$;
    }

    getFavoriteLocations() {
        return this.http.get('v1/users/@me/starred');
    }

    updateFavoriteLocations(body) {
        return this.http.put('v1/users/@me/starred', body);
    }

    get isFocused() {
      return this.focused.asObservable();
    }
}
