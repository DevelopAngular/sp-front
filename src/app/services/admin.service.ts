import {Injectable} from '@angular/core';

import {HttpService} from './http-service';
import {School} from '../models/School';
import {ReportDataUpdate} from '../models/Report';
import {Observable, of, Subject} from 'rxjs';
import {GSuiteOrgs} from '../models/GSuiteOrgs';
import {AppState} from '../ngrx/app-state/app-state';
import {Store} from '@ngrx/store';
import {
  getAddedReports,
  getFoundReports,
  getCurrentReport, 
  getIsLoadedReports,
  getIsLoadingReports,
  getReportsCollection,
  getReportsEntities,
  getReportsLength,
  getReportsNextUrl
} from '../ngrx/reports/states/reports-getters.state';
import {getMoreReports, getReports, postReport, searchReports, patchReport} from '../ngrx/reports/actions';
import {getCountAccountsResult} from '../ngrx/accounts/nested-states/count-accounts/state/count-accouns-getters.state';
import {getCountAccounts} from '../ngrx/accounts/nested-states/count-accounts/actions';
import {getDashboardData} from '../ngrx/dashboard/actions';
import {getDashboardDataResult} from '../ngrx/dashboard/states/dashboard-getters.state';
import {ColorProfile} from '../models/ColorProfile';
import {getColorProfilesCollection, getLoadedColors, getLoadingColors} from '../ngrx/color-profiles/states/colors-getters.state';
import {getColorProfiles} from '../ngrx/color-profiles/actions';
import {getLoadedProcess, getLoadingProcess, getProcessEntities} from '../ngrx/onboard-process/states/process-getters.state';
import {getOnboardProcess, updateOnboardProcess} from '../ngrx/onboard-process/actions';
import {
  getCleverInfo,
  getGSuiteSyncInfo,
  getSchoolsGG4LInfo,
  getSchoolSyncInfo,
  syncClever,
  syncGsuite,
  updateCleverInfo,
  updateGSuiteInfo,
  updateSchool,
  updateSchoolSyncInfo
} from '../ngrx/schools/actions';
import {getGG4LInfoData, getGSuiteSyncInfoData, getSchoolCleverInfo, getSchoolSyncInfoData, getSyncLoading} from '../ngrx/schools/states';
import {GG4LSync} from '../models/GG4LSync';
import {SchoolSyncInfo} from '../models/SchoolSyncInfo';
import {Onboard} from '../models/Onboard';
import {CleverInfo} from '../models/CleverInfo';
import {constructUrl} from '../live-data/helpers';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  searchAccountEmit$: Subject<string> = new Subject<string>();
  reports = {
    reports$: this.store.select(getReportsCollection),
    loaded$: this.store.select(getIsLoadedReports),
    loading$: this.store.select(getIsLoadingReports),
    length: this.store.select(getReportsLength),
    foundReports: this.store.select(getFoundReports),
    addedReports: this.store.select(getAddedReports),
    currentReport$: this.store.select(getCurrentReport),
    nextUrl$: this.store.select(getReportsNextUrl),
    entities$: this.store.select(getReportsEntities)
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
  cleverInfoData$: Observable<CleverInfo> = this.store.select(getSchoolCleverInfo);
  syncLoading$: Observable<boolean> = this.store.select(getSyncLoading);

  constructor(private http: HttpService,  private store: Store<AppState>) {}

  /// Reports

  getReportsRequest(queryParams) {
    return this.http.get(constructUrl(`v1/event_reports`, queryParams));
  }

  getReportsData(queryParams) {
    this.store.dispatch(getReports({ queryParams }));
    return this.reports.reports$;
  }

  getReportsByUrl(url) {
    return this.http.get(url);
  }

  getMoreReports() {
    this.store.dispatch(getMoreReports());
  }

  sendReportRequest(data) {
    this.store.dispatch(postReport({data}));
    return this.reports.addedReports;
  }

  sendReport(data) {
    return this.http.post('v1/event_reports/bulk_create', data);
  }

  updateReportRequest(updata: ReportDataUpdate) {
    this.store.dispatch(patchReport({updata}));
    return this.http.currentUpdateReport$;
  }

  updateReport(updata: ReportDataUpdate) {
    const id = updata.id;
    delete updata.id;
    const data = {...updata};
    return this.http.patch(`v1/event_reports/${id}`, data);
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

  getSpSyncingRequest() {
    this.store.dispatch(getSchoolSyncInfo());
    return this.schoolSyncInfo$;
  }

  updateSpSyncingRequest(data) {
    this.store.dispatch(updateSchoolSyncInfo({data}));
    return this.schoolSyncInfo$;
  }

  getSpSyncing() {
    const school = this.http.getSchool();
    return this.http.get(`v1/schools/${school.id}/syncing`);
  }

  updateSpSyncing(body) {
    const school = this.http.getSchool();
    return this.http.patch(`v1/schools/${school.id}/syncing`, body);
  }

  getGSuiteAuthorizeLink() {
    const school = this.http.getSchool();
    return this.http.get(`v1/schools/${school.id}/syncing/gsuite/authorization_link`);
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
    return this.http.get(`v1/schools/${this.http.getSchool().id}/syncing/gg4l/status`);
  }

  getGSuiteOrgsRequest() {
    this.store.dispatch(getGSuiteSyncInfo());
    return this.gSuiteInfoData$;
  }

  getGSuiteOrgs(): Observable<GSuiteOrgs> {
    return this.http.get(`v1/schools/${this.http.getSchool().id}/syncing/gsuite/status`);
  }

  getCleverInfoRequest() {
    this.store.dispatch(getCleverInfo());
  }

  getCleverInfo() {
    return this.http.get(`v1/schools/${this.http.getSchool().id}/syncing/clever/status`);
  }

  cleverSyncNow() {
    return this.http.post(`v1/schools/${this.http.getSchool().id}/syncing/clever/manual_sync`);
  }

  gsuiteSyncNowRequest() {
    this.store.dispatch(syncGsuite());
  }

  gsuiteSyncNow() {
    return this.http.post(`v1/schools/${this.http.getSchool().id}/syncing/gsuite/manual_sync`);
  }

  syncLoading() {
    this.store.dispatch(syncClever());
  }

  updateCleverInfo(cleverInfo) {
    this.store.dispatch(updateCleverInfo({cleverInfo}));
  }

  updateGsuiteInfo(gsuiteInfo) {
    this.store.dispatch(updateGSuiteInfo({gsuiteInfo}));
  }

  exportCsvPasses(queryParams: object) {
    const blacklist = ['total_count', 'limit'];

    // Filter out keys specified in blacklist
    const filtered = Object.keys(queryParams)
        .filter(key => !blacklist.includes(key))
        .reduce((obj, key) => {
          obj[key] = queryParams[key];
          return obj;
        }, {});

    const url = constructUrl('v1/admin/export/hall_passes', filtered);
    return this.http.post(url);
  }
}
