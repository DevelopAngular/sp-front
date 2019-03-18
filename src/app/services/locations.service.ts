import { Injectable } from '@angular/core';
import {Paged} from '../models';
import {HttpService} from './http-service';
import {User} from "../models/User";

@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  constructor(private http: HttpService) { }

    getLocationsWithCategory(category: string) {
        return this.http.get(`v1/locations?category=${category}&`);
    }

    getLocationsWithTeacher(teacher: User) {
        return this.http.get<any[]>(`v1/locations?teacher_id=${teacher.id}`);
    }

    getLocation(id) {
        return this.http.get(`v1/locations/${id}`);
    }

    createLocation(data) {
        return this.http.post('v1/locations', data);
    }

    updateLocation(id, data) {
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
}
