import { Injectable } from '@angular/core';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import {bufferCount, flatMap, reduce, tap} from 'rxjs/operators';
import { constructUrl } from '../live-data/helpers';
import { Paged } from '../models';
import { HttpService } from './http-service';
import { User } from '../models/User';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import { Location } from '../models/Location';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {getLocsWithTeachers} from '../ngrx/locations/actions';
import {getLocationsCollection} from '../ngrx/locations/state/locations-getters.state';
import {filter, map, skip, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  locations$: Observable<Location[]> = this.store.select(getLocationsCollection);

  myRoomSelectedLocation$: BehaviorSubject<Location> = new BehaviorSubject(null);

  focused: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(private http: HttpService, private store: Store<AppState>) { }

    getLocationsWithCategory(category: string) {
        return this.http.get(`v1/locations?category=${category}&`);
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

    createLocation(data) {
        return this.http.post('v1/locations', data);
    }

    updateLocation(id, data) {
      console.log(data);
      return this.http.patch(`v1/locations/${id}`, data);
    }

    deleteLocation(id) {
        return this.http.delete(`v1/locations/${id}`);
    }

    searchLocationsWithConfig(url) {
        return this.http.get<Paged<any>>(url);
    }

    searchLocations(limit = 10, config = '') {
        return this.http.get<Paged<any>>(`v1/locations?limit=${limit}${config}`);
    }

    getLocationsWithFilder() {
      return this.http.get('v1/locations/categorized');
    }

    checkLocationName(value) {
        return this.http.get(`v1/locations/check_fields?title=${value}`);
    }

    checkLocationNumber(value) {
        return this.http.get(`v1/locations/check_fields?room=${value}`);
    }

    /////// Favorite Locations
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
