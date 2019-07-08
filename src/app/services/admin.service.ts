import { Injectable } from '@angular/core';

import { HttpService } from './http-service';
import { School } from '../models/School';
import { Observable } from 'rxjs';
import {GSuiteOrgs} from '../models/GSuiteOrgs';
import {switchMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpService) {

  }

  /// Reports

  getReports(limit = 10) {
    return this.http.get(`v1/event_reports?limit=${limit}`);
  }

  sendReport(data) {
    return this.http.post('v1/event_reports/bulk_create', data);
  }

  searchReports(before, after) {
    return this.http.get(`v1/event_reports?created_before=${before}&created_after=${after}`);
  }

  //// Admin

  getAccountSyncLink(schoolId: number) {
    return this.http.post(`v1/schools/${schoolId}/syncing/authorize`);
  }

  getAdminAccounts() {
    return this.http.get('v1/admin/accounts');
  }

  getDashboardData() {
    return this.http.get('v1/admin/dashboard');
  }

  getOnboardProgress() {
    return this.http.get('v1/admin/onboard_progress');
  }

  getGSuiteOrgs(): Observable<GSuiteOrgs> {
      return this.http.currentSchool$.pipe(
          switchMap(school => this.http.get(`v1/schools/${school.id}/syncing/gsuite/status`)));
  }

  syncNow() {
    return this.http.currentSchool$.pipe(
          switchMap(school => this.http.post(`v1/schools/${school.id}/syncing/manual_sync`)));
  }

  updateOnboardProgress(name) {
    return this.http.put(`v1/admin/onboard_progress/${name}`);
  }

  getFilteredDashboardData(date: Date) {
    // create a date in format YYYY-MM-DD
    const dateStr = date.toISOString().substring(0, 10);
    return this.http.get(`v1/admin/dashboard?start=${dateStr}`);
  }

  //// Color Profile
  getColors() {
    return this.http.get('v1/color_profiles');
  }

  //// Schools
  getSchools(): Observable<School[]> {
    return this.http.get('v1/schools');
  }

  getSchoolById(id: number): Observable<School> {
    return this.http.get(`v1/schools/${id}`);
  }

  updateSchoolSettings(id, settings) {
    return this.http.patch(`v1/schools/${id}`, settings);
  }
}
