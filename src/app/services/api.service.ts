import { Injectable } from '@angular/core';

import { HttpService } from './http-service';
import { School } from '../models/School';
import {Observable} from 'rxjs';
import {Pinnable} from '../models/Pinnable';
import {User} from '../models/User';
import {Paged} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpService) { }

  //// User
  getUser() {
    return this.http.get<User>('v1/users/@me');
  }

  /// Locations
  getLocationsWithCategory(category: string) {
    return this.http.get(`v1/locations?category=${category}&`);
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

  searchLocations(limit = 10, config = '') {
      return this.http.get(`v1/locations?limit=${limit}${config}`);
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

  /// Pinnables
  getPinnables(): Observable<Pinnable[]> {
    return this.http.get('v1/pinnables/arranged');
  }
  createPinnable(data) {
    return this.http.post('v1/pinnables', data);
  }

  updatePinnable(id, data) {
    return this.http.patch(`v1/pinnables/${id}`, data);
  }

  deletePinnable(id) {
    return this.http.delete(`v1/pinnables/${id}`);
  }

  checkPinnableName(value) {
    return this.http.get(`v1/pinnables/check_fields?title=${value}`);
  }
  /// Arranged Pinnables
  getArrangedPinnables() {
    return this.http.get('v1/pinnables?arranged=true');
  }

  createArrangedPinnable(body) {
    return this.http.post(`v1/pinnables/arranged`, body);
  }

  //// Invitations
  createInvitation(data) {
    return this.http.post('v1/invitations/bulk_create', data);
  }

  acceptInvitation(id, data) {
    return this.http.post(`v1/invitations/${id}/accept`, data);
  }

  denyInvitation(id, data) {
    return this.http.post(`v1/invitations/${id}/deny`, data);
  }

  cancelInvitation(id, data) {
    return this.http.post(`v1/invitations/${id}/cancel`, data);
  }

  /// Requests
  createRequest(data) {
    return this.http.post('v1/pass_requests', data);
  }

  acceptRequest(id, data) {
    return this.http.post(`v1/pass_requests/${id}/accept`, data);
  }

  denyRequest(id, data) {
    return this.http.post(`v1/pass_requests/${id}/deny`, data);
  }

  cancelRequest(id) {
    return this.http.post(`v1/pass_requests/${id}/cancel`);
  }

  //// Hall Pass
  getActivePasses() {
    return this.http.get('v1/hall_passes?active=true');
  }

  createPass(data) {
    return this.http.post('v1/hall_passes', data);
  }

  endPass(id) {
    return this.http.post(`v1/hall_passes/${id}/ended`);
  }

  getPassStats() {
    return this.http.get('v1/hall_passes/stats');
  }

  /// Reports
  getReports() {
    return this.http.get('v1/event_reports');
  }
  searchReports(before, after) {
    return this.http.get(`v1/event_reports?created_before=${before}&created_after=${after}`);
  }

  //// Student Groups
  getStudentGroups() {
    return this.http.get('v1/student_lists');
  }

  createStudentGroup(data) {
    return this.http.post('v1/student_lists', data);
  }

  updateStudentGroup(id, body) {
    return this.http.patch(`v1/student_lists/${id}`, body);
  }

  deleteStudentGroup(id) {
    return this.http.delete(`v1/student_lists/${id}`);
  }

  searchProfile(role, limit = 5, search) {
    return this.http.get<Paged<any>>(`v1/users?role=${role}&limit=${limit}&search=${search}`);
  }

  //// Admin
  getAdminAccounts() {
    return this.http.get('v1/admin/accounts');
  }

  getDashboardData() {
    return this.http.get('v1/admin/dashboard');
  }

  //// Icons
  getIcons() {
    return this.http.get('v1/room_icons');
  }

  //// Color Profile
  getColors() {
    return this.http.get('v1/color_profiles');
  }

  //// Schools
  getSchools(): Observable<School[]> {
    return this.http.get('v1/schools');
  }
}
