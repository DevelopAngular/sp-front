import { Injectable } from '@angular/core';

import { HttpService } from './http-service';
import { School } from '../models/School';
import {Observable, of} from 'rxjs';
import {GSuiteOrgs} from '../models/GSuiteOrgs';
import {share, switchMap, take} from 'rxjs/operators';
import {AppState} from '../ngrx/app-state/app-state';
import {Store} from '@ngrx/store';
import {getFoundReports, getIsLoadedReports, getIsLoadingReports, getReportsCollection} from '../ngrx/reports/states/reports-getters.state';
import {getReports, searchReports} from '../ngrx/reports/actions';
import {getCountAccountsResult} from '../ngrx/accounts/nested-states/count-accounts/state/count-accouns-getters.state';
import {getCountAccounts} from '../ngrx/accounts/nested-states/count-accounts/actions';
import {getDashboardData} from '../ngrx/dashboard/actions';
import {getDashboardDataResult} from '../ngrx/dashboard/states/dashboard-getters.state';
import {ColorProfile} from '../models/ColorProfile';
import {getColorProfilesCollection, getLoadedColors, getLoadingColors} from '../ngrx/color-profiles/states/colors-getters.state';
import {getColorProfiles} from '../ngrx/color-profiles/actions';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  reports = {
    reports$: this.store.select(getReportsCollection),
    loaded$: this.store.select(getIsLoadedReports),
    loading$: this.store.select(getIsLoadingReports),
    foundReports: this.store.select(getFoundReports)
  };

  colorProfiles$: Observable<ColorProfile[]> = this.store.select(getColorProfilesCollection);
  loadingColorProfiles$: Observable<boolean> = this.store.select(getLoadingColors);
  loadedColorProfiles$: Observable<boolean> = this.store.select(getLoadedColors);

  countAccounts$ = this.store.select(getCountAccountsResult);
  dashboardData$ = this.store.select(getDashboardDataResult);

  constructor(private http: HttpService,  private store: Store<AppState>) {}

  /// Reports

  getReportsRequest(limit) {
    return this.http.get(`v1/event_reports?limit=${limit}`);
  }

  getReportsData(limit = 10) {
    this.store.dispatch(getReports({ limit }));
    return this.reports.reports$;
  }

  sendReport(data) {
    return this.http.post('v1/event_reports/bulk_create', data);
  }

  searchReportsRequest(before, after) {
    this.store.dispatch(searchReports({before, after}));
    return this.reports.foundReports;
  }

  searchReports(before, after) {
    return this.http.get(`v1/event_reports?created_before=${before}&created_after=${after}`);
  }

  //// Admin

  getAccountSyncLink(schoolId: number) {
    return this.http.post(`v1/schools/${schoolId}/syncing/authorize`);
  }

  getCountAccountsRequest() {
    this.store.dispatch(getCountAccounts());
    return this.countAccounts$;
  }

  getAdminAccounts() {
    return this.http.get('v1/admin/accounts');
  }

  getDashboardDataRequest() {
    this.store.dispatch(getDashboardData());
    return this.dashboardData$;
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
  updateGSuiteOrgs(body) {
    return this.http.currentSchool$.pipe(
          switchMap(school => this.http.patch(`v1/schools/${school.id}/syncing`, body)));
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
  getColorsRequest() {
    this.store.dispatch(getColorProfiles());
    return this.colorProfiles$;
  }

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
