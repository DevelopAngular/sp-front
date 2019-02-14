import { Injectable } from '@angular/core';

import { HttpService } from './http-service';
import { School } from '../models/School';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpService) { }

  /// Reports
  getReports() {
    return this.http.get('v1/event_reports');
  }

  sendReport(data) {
    return this.http.post('v1/event_reports/bulk_create', data);
  }

  searchReports(before, after) {
    return this.http.get(`v1/event_reports?created_before=${before}&created_after=${after}`);
  }

  //// Admin
  getAdminAccounts() {
    return this.http.get('v1/admin/accounts');
  }

  getDashboardData() {
    return this.http.get('v1/admin/dashboard');
  }

  getFilteredDashboardData(date: Date) {
    // create a date in format YYYY-MM-DD
    const dateStr = date.toISOString().substring(0, 10);
    return this.http.get(`v1/admin/dashboard?start=${dateStr}`);
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
