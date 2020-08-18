import { Injectable } from '@angular/core';

import { HttpService } from './http-service';
import { School } from '../models/School';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {GSuiteOrgs} from '../models/GSuiteOrgs';
import {switchMap} from 'rxjs/operators';
import {AppState} from '../ngrx/app-state/app-state';
import {Store} from '@ngrx/store';
import {
  getAddedReports,
  getFoundReports,
  getIsLoadedReports,
  getIsLoadingReports,
  getReportsCollection
} from '../ngrx/reports/states/reports-getters.state';
import {getReports, postReport, searchReports} from '../ngrx/reports/actions';
import {getCountAccountsResult} from '../ngrx/accounts/nested-states/count-accounts/state/count-accouns-getters.state';
import {getCountAccounts} from '../ngrx/accounts/nested-states/count-accounts/actions';
import {getDashboardData} from '../ngrx/dashboard/actions';
import {getDashboardDataResult} from '../ngrx/dashboard/states/dashboard-getters.state';
import {ColorProfile} from '../models/ColorProfile';
import {getColorProfilesCollection, getLoadedColors, getLoadingColors} from '../ngrx/color-profiles/states/colors-getters.state';
import {getColorProfiles} from '../ngrx/color-profiles/actions';
import {
  getLoadedProcess,
  getLoadingProcess,
  getProcessData,
  getProcessEntities
} from '../ngrx/onboard-process/states/process-getters.state';
import {getOnboardProcess, updateOnboardProcess} from '../ngrx/onboard-process/actions';
import {getGSuiteSyncInfo, getSchoolsGG4LInfo, getSchoolSyncInfo, updateSchool, updateSchoolSyncInfo} from '../ngrx/schools/actions';
import {getGG4LInfoData, getGSuiteSyncInfoData, getSchoolSyncInfoData} from '../ngrx/schools/states';
import {GG4LSync} from '../models/GG4LSync';
import {SchoolSyncInfo} from '../models/SchoolSyncInfo';
import {Onboard} from '../models/Onboard';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  searchAccountEmit$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  reports = {
    reports$: this.store.select(getReportsCollection),
    loaded$: this.store.select(getIsLoadedReports),
    loading$: this.store.select(getIsLoadingReports),
    foundReports: this.store.select(getFoundReports),
    addedReports: this.store.select(getAddedReports)
  };

  colorProfiles$: Observable<ColorProfile[]> = this.store.select(getColorProfilesCollection);
  loadingColorProfiles$: Observable<boolean> = this.store.select(getLoadingColors);
  loadedColorProfiles$: Observable<boolean> = this.store.select(getLoadedColors);

  onboardProcessData$: Observable<{[id: string]: Onboard}> = this.store.select(getProcessEntities);
  loadedOnboardProcess$: Observable<boolean> = this.store.select(getLoadedProcess);
  loadingOnboardProcess$: Observable<boolean> = this.store.select(getLoadingProcess);

  countAccounts$ = this.store.select(getCountAccountsResult);
  dashboardData$ = this.store.select(getDashboardDataResult);
  gg4lInfo$: Observable<GG4LSync> = this.store.select(getGG4LInfoData);
  schoolSyncInfo$: Observable<SchoolSyncInfo> = this.store.select(getSchoolSyncInfoData);
  gSuiteInfoData$: Observable<GSuiteOrgs> = this.store.select(getGSuiteSyncInfoData);

  constructor(private http: HttpService,  private store: Store<AppState>) {}

  /// Reports

  getReportsRequest(limit) {
    return this.http.get(`v1/event_reports?limit=${limit}`);
  }

  getReportsData(limit = 10) {
    this.store.dispatch(getReports({ limit }));
    return this.reports.reports$;
  }
  sendReportRequest(data) {
    this.store.dispatch(postReport({data}));
    return this.reports.addedReports;
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
    return of(null);
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

  getOnboardProcessRequest() {
    this.store.dispatch(getOnboardProcess());
    return this.onboardProcessData$;
  }

  getOnboardProgress() {
    return this.http.get('v1/admin/onboard_progress');
  }

  syncNow() {
    return this.http.currentSchool$.pipe(
          switchMap(school => this.http.post(`v1/schools/${school.id}/syncing/manual_sync`)));
  }

  getSpSyncingRequest() {
    this.store.dispatch(getSchoolSyncInfo());
    return this.schoolSyncInfo$;
  }

  updateSpSyncingRequest(data) {
    this.store.dispatch(updateSchoolSyncInfo({data}));
    return this.schoolSyncInfo$;
  }

  getSpSyncing() {
    return this.http.currentSchool$.pipe(
      switchMap(school => this.http.get(`v1/schools/${school.id}/syncing`)));
  }

  updateSpSyncing(body) {
    return this.http.currentSchool$.pipe(
          switchMap(school => this.http.patch(`v1/schools/${school.id}/syncing`, body)));
  }

  updateOnboardProgressRequest(data) {
    this.store.dispatch(updateOnboardProcess({data}));
    return this.onboardProcessData$;
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

  getSchoolById(id: number): Observable<School> {
    return this.http.get(`v1/schools/${id}`);
  }

  updateSchoolSettingsRequest(school, fieldsToUpdate) {
    this.store.dispatch(updateSchool({school, fields: fieldsToUpdate}));
    return this.http.currentUpdateSchool$;
  }

  updateSchoolSettings(id, settings) {
    return this.http.patch(`v1/schools/${id}`, settings);
  }

  getGG4LSyncInfoRequest() {
    this.store.dispatch(getSchoolsGG4LInfo());
    return this.gg4lInfo$;
  }

  getGG4LSyncInfo() {
    return this.http.currentSchool$.pipe(
      switchMap(school => this.http.get(`v1/schools/${school.id}/syncing/gg4l/status`))
    );
  }

  getGSuiteOrgsRequest() {
    this.store.dispatch(getGSuiteSyncInfo());
    return this.gSuiteInfoData$;
  }

  getGSuiteOrgs(): Observable<GSuiteOrgs> {
    return this.http.currentSchool$.pipe(
      switchMap(school => this.http.get(`v1/schools/${school.id}/syncing/gsuite/status`)));
  }
}
