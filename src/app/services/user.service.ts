import {ErrorHandler, Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, interval, merge, Observable, of, race, ReplaySubject, Subject} from 'rxjs';
import {SentryErrorHandler} from '../error-handler';
import {HttpService} from './http-service';
import {constructUrl} from '../live-data/helpers';
import {Logger} from './logger.service';
import {User} from '../models/User';
import {PollingService} from './polling-service';
import {exhaustMap, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {Paged} from '../models';
import {RepresentedUser} from '../navbar/navbar.component';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {
  addUserToProfile,
  bulkAddAccounts,
  clearCurrentUpdatedAccount,
  getAccounts,
  getMoreAccounts,
  postAccounts,
  removeAccount,
  sortAccounts,
  updateAccountActivity,
  updateAccountPermissions,
  updateAccountPicture
} from '../ngrx/accounts/actions/accounts.actions';
import {
  getAllAccountsCollection,
  getAllAccountsEntities,
  getCountAllAccounts,
  getLastAddedAllAccounts,
  getLoadedAllAccounts,
  getLoadingAllAccounts,
  getNextRequestAllAccounts
} from '../ngrx/accounts/nested-states/all-accounts/states/all-accounts-getters.state';
import {
  getAddedAdmin,
  getAdminsAccountsEntities,
  getAdminsCollections,
  getAdminSort,
  getCountAdmins,
  getCurrentUpdatedAdmin,
  getLastAddedAdminsAccounts,
  getLoadedAdminsAccounts,
  getLoadingAdminsAccounts,
  getNextRequestAdminsAccounts
} from '../ngrx/accounts/nested-states/admins/states/admins.getters.state';
import {
  getAddedTeacher,
  getCountTeachers,
  getCurrentUpdatedTeacher,
  getLastAddedTeachers,
  getLoadedTeachers,
  getLoadingTeachers,
  getNextRequestTeachers,
  getTeacherAccountsCollection,
  getTeachersAccountsEntities,
  getTeacherSort
} from '../ngrx/accounts/nested-states/teachers/states/teachers-getters.state';
import {
  getAddedAssistant,
  getAssistantsAccountsCollection,
  getAssistantsAccountsEntities,
  getAssistantSort,
  getCountAssistants,
  getCurrentUpdatedAssistant,
  getLastAddedAssistants,
  getLoadedAssistants,
  getLoadingAssistants,
  getNextRequestAssistants
} from '../ngrx/accounts/nested-states/assistants/states';
import {
  getAddedStudent,
  getCountStudents,
  getCurrentUpdatedStudent,
  getLastAddedStudents,
  getLoadedStudents,
  getLoadingStudents,
  getNextRequestStudents,
  getStudentsAccountsCollection,
  getStudentsAccountsEntities,
  getStudentSort,
  getStudentsStats,
  getStudentsStatsLoaded,
  getStudentsStatsLoading
} from '../ngrx/accounts/nested-states/students/states';
import {getStudentGroups, postStudentGroup, removeStudentGroup, updateStudentGroup} from '../ngrx/student-groups/actions';
import {StudentList} from '../models/StudentList';
import {
  getCurrentStudentGroup,
  getLoadedGroups,
  getLoadingGroups,
  getStudentGroupsCollection
} from '../ngrx/student-groups/states/groups-getters.state';
import {getCurrentUpdatedUser, getLoadedUser, getNuxDates, getSelectUserPin, getUserData} from '../ngrx/user/states/user-getters.state';
import {clearUser, getNuxAction, getUser, getUserPinAction, updateUserAction} from '../ngrx/user/actions';
import {addRepresentedUserAction, removeRepresentedUserAction} from '../ngrx/accounts/nested-states/assistants/actions';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {getIntros, updateIntros, updateIntrosEncounter, updateIntrosMain, updateIntrosSearch} from '../ngrx/intros/actions';
import {getIntrosData} from '../ngrx/intros/state';
import {clearSchools, getSchoolsFailure} from '../ngrx/schools/actions';
import {clearRUsers, getRUsers, updateEffectiveUser} from '../ngrx/represented-users/actions';
import {getEffectiveUser, getRepresentedUsersCollections} from '../ngrx/represented-users/states';
import {
  clearProfilePicturesUploadErrors,
  clearUploadedData,
  deleteProfilePicture,
  getMissingProfilePictures,
  getProfilePicturesUploadedGroups,
  getUploadedErrors,
  postProfilePictures,
  putUploadErrors
} from '../ngrx/profile-pictures/actions';
import {
  getCurrentUploadedGroup,
  getLastUploadedGroup,
  getMissingProfiles,
  getProfilePicturesLoaded,
  getProfilePicturesLoaderPercent,
  getProfilePicturesLoading,
  getProfiles,
  getUploadedGroups,
  getUploadErrors
} from '../ngrx/profile-pictures/states';
import {updateTeacherLocations} from '../ngrx/accounts/nested-states/teachers/actions';
import {ProfilePicturesUploadGroup} from '../models/ProfilePicturesUploadGroup';
import {ProfilePicturesError} from '../models/ProfilePicturesError';
import {LoginDataService} from './login-data.service';
import {GoogleLoginService} from './google-login.service';
import {School} from '../models/School';
import {UserStats} from '../models/UserStats';
import {getStudentStats} from '../ngrx/accounts/nested-states/students/actions';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

  /**
  * Used for acting on behalf of some teacher by his assistant
  */
  public effectiveUser: Observable<RepresentedUser> = this.store.select(getEffectiveUser);
  public representedUsers: Observable<RepresentedUser[]> = this.store.select(getRepresentedUsersCollections);

  /**
   * Accounts from store
   */
  accounts = {
    allAccounts: this.store.select(getAllAccountsCollection),
    adminAccounts: this.store.select(getAdminsCollections),
    teacherAccounts: this.store.select(getTeacherAccountsCollection),
    assistantAccounts: this.store.select(getAssistantsAccountsCollection),
    studentAccounts: this.store.select(getStudentsAccountsCollection)
  };

  countAccounts$ = {
    _all: this.store.select(getCountAllAccounts),
    _profile_admin: this.store.select(getCountAdmins),
    _profile_student: this.store.select(getCountStudents),
    _profile_teacher: this.store.select(getCountTeachers),
    _profile_assistant: this.store.select(getCountAssistants)
  };

  accountsEntities = {
    _all: this.store.select(getAllAccountsEntities),
    _profile_admin: this.store.select(getAdminsAccountsEntities),
    _profile_teacher: this.store.select(getTeachersAccountsEntities),
    _profile_student: this.store.select(getStudentsAccountsEntities),
    _profile_assistant: this.store.select(getAssistantsAccountsEntities)
  };

  isLoadedAccounts$ = {
    all: this.store.select(getLoadedAllAccounts),
    admin: this.store.select(getLoadedAdminsAccounts),
    teacher: this.store.select(getLoadedTeachers),
    student: this.store.select(getLoadedStudents),
    assistant: this.store.select(getLoadedAssistants)
  };

  isLoadingAccounts$ = {
    all: this.store.select(getLoadingAllAccounts),
    admin: this.store.select(getLoadingAdminsAccounts),
    teacher: this.store.select(getLoadingTeachers),
    student: this.store.select(getLoadingStudents),
    assistant: this.store.select(getLoadingAssistants)
  };

  lastAddedAccounts$ = {
    _all: this.store.select(getLastAddedAllAccounts),
    _profile_student: this.store.select(getLastAddedStudents),
    _profile_teacher: this.store.select(getLastAddedTeachers),
    _profile_admin: this.store.select(getLastAddedAdminsAccounts),
    _profile_assistant: this.store.select(getLastAddedAssistants)
  };

  nextRequests$ = {
    _all: this.store.select(getNextRequestAllAccounts),
    _profile_student: this.store.select(getNextRequestStudents),
    _profile_teacher: this.store.select(getNextRequestTeachers),
    _profile_admin: this.store.select(getNextRequestAdminsAccounts),
    _profile_assistant: this.store.select(getNextRequestAssistants)
  };

  accountSort$ = {
    _profile_admin: this.store.select(getAdminSort),
    _profile_teacher: this.store.select(getTeacherSort),
    _profile_student: this.store.select(getStudentSort),
    _profile_assistant: this.store.select(getAssistantSort)
  };

  addedAccount$ = {
    _profile_admin: this.store.select(getAddedAdmin),
    _profile_teacher: this.store.select(getAddedTeacher),
    _profile_student: this.store.select(getAddedStudent),
    _profile_assistant: this.store.select(getAddedAssistant)
  };

  currentUpdatedAccount$ = {
    _profile_admin: this.store.select(getCurrentUpdatedAdmin),
    _profile_teacher: this.store.select(getCurrentUpdatedTeacher),
    _profile_student: this.store.select(getCurrentUpdatedStudent),
    _profile_assistant: this.store.select(getCurrentUpdatedAssistant)
  };

  /**
   * Current User
   */
  user$: Observable<User> = this.store.select(getUserData);
  userPin$: Observable<string | number> = this.store.select(getSelectUserPin);
  loadedUser$: Observable<boolean> = this.store.select(getLoadedUser);
  currentUpdatedUser$: Observable<User> = this.store.select(getCurrentUpdatedUser)

  /**
  * Student Groups
   */
  studentGroups$: Observable<StudentList[]> = this.store.select(getStudentGroupsCollection);
  currentStudentGroup$: Observable<StudentList> = this.store.select(getCurrentStudentGroup);
  isLoadingStudentGroups$: Observable<boolean> = this.store.select(getLoadingGroups);
  isLoadedStudentGroups$: Observable<boolean> = this.store.select(getLoadedGroups);
  blockUserPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
  * Profile Pictures
   */
  profilePicturesLoading$: Observable<boolean> = this.store.select(getProfilePicturesLoading);
  profilePicturesLoaded$: Observable<boolean> = this.store.select(getProfilePicturesLoaded);
  profiles$: Observable<User[]> = this.store.select(getProfiles);
  profilePictureLoaderPercent$: Observable<number> = this.store.select(getProfilePicturesLoaderPercent);
  profilePicturesErrors$: Subject<{[id: string]: string, error: string}> = new Subject();
  uploadedGroups$: Observable<ProfilePicturesUploadGroup[]> = this.store.select(getUploadedGroups);
  currentUploadedGroup$: Observable<ProfilePicturesUploadGroup> = this.store.select(getCurrentUploadedGroup);
  lastUploadedGroup$: Observable<ProfilePicturesUploadGroup> = this.store.select(getLastUploadedGroup);
  missingProfilePictures$: Observable<User[]> = this.store.select(getMissingProfiles);
  profilePicturesUploadErrors$: Observable<ProfilePicturesError[]> = this.store.select(getUploadErrors);

  /**
   * Students Stats
   */
  studentsStats$: Observable<{[id: string]: UserStats}> = this.store.select(getStudentsStats);
  studentsStatsLoading$: Observable<boolean> = this.store.select(getStudentsStatsLoading);
  studentsStatsLoaded$: Observable<boolean> = this.store.select(getStudentsStatsLoaded);

  introsData$: Observable<any> = this.store.select(getIntrosData);

  nuxDates$: Observable<{id: string, created: Date}[]> = this.store.select(getNuxDates);

  isEnableProfilePictures$: Observable<boolean>;

  schools$: Observable<School[]>;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private http: HttpService,
    private httpClient: HttpClient,
    private pollingService: PollingService,
    private _logging: Logger,
    private errorHandler: ErrorHandler,
    private store: Store<AppState>,
    private loginService: GoogleLoginService,
    private loginDataService: LoginDataService
  ) {
    this.schools$ = this.http.schools$;
    this.http.globalReload$
        .pipe(
          tap(() => {
            this.http.effectiveUserId.next(null);
            this.clearRepresentedUsers();
            this.getUserRequest();
            this.getNuxRequest();
          }),
          exhaustMap(() => {
            return combineLatest(this.user$.pipe(filter(res => !!res), take(1),
                map(raw => User.fromJSON(raw))
              ), this.loginDataService.loginDataQueryParams.pipe(filter(r => !!r), take(1)));
          }),
          map(([user, queryParams]) => {
            if (queryParams.email) {
              const regexpEmail = new RegExp('^([A-Za-z0-9_\\-.])+@([A-Za-z0-9_\\-.])+\\.([A-Za-z]{2,4})$');
              const isValidEmail = regexpEmail.test(queryParams.email) ? user.primary_email === queryParams.email : user.primary_email === queryParams.email + '@spnx.local';
              if (!isValidEmail) {
                this.http.clearInternal();
                this.http.setSchool(null);
                this.loginService.clearInternal(true);
                this.userData.next(null);
                this.clearUser();
                this.store.dispatch(clearSchools());
              }
            }
            return user;
          }),
          tap(user => {
            if (user.isAssistant()) {
              this.getUserRepresentedRequest();
            }
          }),
          switchMap((user: User) => {
            this.blockUserPage$.next(false);
            if (user.isAssistant()) {
              return combineLatest(this.representedUsers.pipe(filter((res) => !!res)), this.http.schoolsCollection$)
                .pipe(
                  tap(([users, schools]) => {
                    if (!users.length && schools.length === 1) {
                      this.store.dispatch(getSchoolsFailure({errorMessage: 'Assistant does`t have teachers'}));
                    } else if (!users.length && schools.length > 1) {
                      this.blockUserPage$.next(true);
                    }
                  }),
                  filter(([users, schools]) => !!users.length || schools.length > 1),
                  map(([users, schools]) => {
                    if (users && users.length) {
                      this.http.effectiveUserId.next(+users[0].user.id);
                    }
                    return user;
                  }));
            } else {
              return of(user);
            }
          }),
          tap((user) => {
            if (user.isTeacher() || user.isAssistant()) {
              this.getUserPinRequest();
            }
          }),
          takeUntil(this.destroy$)
        )
        .subscribe(user => {
          this.userData.next(user);
        });

    this.isEnableProfilePictures$ = merge(this.http.currentSchool$, this.getCurrentUpdatedSchool$()
      .pipe(filter(s => !!s))).pipe(filter(s => !!s), map(school => school.profile_pictures_enabled));

    if (errorHandler instanceof SentryErrorHandler) {
      this.userData.pipe(takeUntil(this.destroy$)).subscribe(user => {
        errorHandler.setUserContext({
          id: user && user.id ? `${user.id}` : 'unknown',
          email: user && user.primary_email ? user.primary_email : 'unknown',
          is_student: user ? user.isStudent() : false,
          is_teacher: user ? user.isTeacher() : false,
          is_admin: user ? user.isAdmin() : false,
        });
      });
    }

    this.pollingService.listen().pipe(takeUntil(this.destroy$)).subscribe(this._logging.debug);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLoadingAccounts(role) {
    if (role === '' || role === '_all') {
      return {loading: this.isLoadingAccounts$.all, loaded: this.isLoadedAccounts$.all};
    } else if (role === '_profile_admin') {
      return {loading: this.isLoadingAccounts$.admin, loaded: this.isLoadedAccounts$.admin};
    } else if (role === '_profile_teacher') {
      return {loading: this.isLoadingAccounts$.teacher, loaded: this.isLoadedAccounts$.teacher};
    } else if (role === '_profile_student') {
      return {loading: this.isLoadingAccounts$.student, loaded: this.isLoadedAccounts$.student};
    } else if (role === '_profile_assistant') {
      return {loading: this.isLoadingAccounts$.assistant, loaded: this.isLoadedAccounts$.assistant};
    }
  }

  getAccountsRole(role) {
    if (role === '' || role === '_all') {
      return this.accounts.allAccounts;
    } else if (role === '_profile_admin') {
      return this.accounts.adminAccounts;
    } else if (role === '_profile_teacher') {
      return this.accounts.teacherAccounts;
    } else if (role === '_profile_student') {
      return this.accounts.studentAccounts;
    } else if (role === '_profile_assistant') {
      return this.accounts.assistantAccounts;
    }
  }

  getAccountsEntities(role) {
    return role ? this.accountsEntities[role] : of(null);
  }

  getUserRequest() {
    this.store.dispatch(getUser());
    return this.user$;
  }

  getUserSchool(): School {
    return this.http.getSchool();
  }

  getCurrentUpdatedSchool$(): Observable<School> {
    return this.http.currentUpdateSchool$;
  }

  clearUser() {
    this.store.dispatch(clearUser());
  }

  getUser() {
     return this.http.get<User>('v1/users/@me');
  }

  getUserPinRequest() {
    this.store.dispatch(getUserPinAction());
    return this.userPin$;
  }

  getUserPin() {
    return this.http.get('v1/users/@me/pin_info');
  }

  updateUserRequest(user: User, data) {
    this.store.dispatch(updateUserAction({user, data}));
    return this.currentUpdatedUser$;
  }

  updateUser(userId, data) {
    return this.http.patch(`v1/users/${userId}`, data);
  }

  getIntrosRequest() {
    this.store.dispatch(getIntros());
  }

  getIntros() {
    return this.http.get('v1/intros');
  }

  updateIntrosRequest(intros, device, version) {
    this.store.dispatch(updateIntros({intros, device, version}));
  }

  updateIntrosMainRequest(intros, device, version) {
    this.store.dispatch(updateIntrosMain({intros, device, version}));
    return of(null);
  }

  updateIntrosEncounterRequest(intros, device, version) {
    this.store.dispatch(updateIntrosEncounter({intros, device, version}));
  }

  updateIntrosSearchRequest(intros, device, version) {
    this.store.dispatch(updateIntrosSearch({intros, device, version}));
  }

  updateIntros(device, version) {
    return this.http.patch('v1/intros/main_intro', {device, version});
  }

  updateIntrosReferral(device, version) {
    return this.http.patch('v1/intros/referral_reminder', {device, version});
  }

  updateIntrosEncounter(device, version) {
    return this.http.patch('v1/intros/encounter_reminder', {device, version});
  }

  updateIntrosSearch(device, version) {
    return this.http.patch('v1/intros/search_reminder', {device, version});
  }

  saveKioskModeLocation(locId) {
    return this.http.post('auth/kiosk', {location: locId});
  }

  getUserRepresentedRequest() {
    this.store.dispatch(getRUsers());
  }

  getUserRepresented() {
     return this.http.get<RepresentedUser[]>('v1/users/@me/represented_users');
  }

  getUserNotification(id) {
    return this.http.get(`v1/users/${id}/notification_settings`);
  }

  enableNotification(id) {
    return this.http.put(`v1/users/@me/notification_settings/${id}`);
  }

  disableNotification(id) {
    return this.http.delete(`v1/users/@me/notification_settings/${id}`);
  }

  searchProfile(role?, limit = 5, search?) {
    search = encodeURIComponent(search);
      return this.http.get<Paged<any>>(`v1/users?${role ? `role=${role}&` : ``}limit=${limit}&search=${search}`);
  }

  searchProfileById(id) {
      return this.http.get<User>(`v1/users/${id}`);
  }

  searchProfileWithFilter(id) {
    return this.http.get(`v1/users?id=${id}`);
  }

  searchUserByCardId(id): Observable<User[]> {
    return this.http.get(constructUrl('v1/users', {search: id}));
  }

  searchProfileAll(search, type: string = 'alternative', excludeProfile?: string, gSuiteRoles?: string[]) {
      switch (type) {
        case 'alternative':
          return this.http.get(constructUrl(`v1/users`, {search: search}), );
        case 'G Suite':
          if (gSuiteRoles) {
            return this.http.get(constructUrl(`v1/schools/${this.http.getSchool().id}/gsuite_users`, {
              search: search,
              profile: gSuiteRoles
            }));
          } else {
            return this.http.get(constructUrl(`v1/schools/${this.http.getSchool().id}/gsuite_users`, {
              search: search
            }));
          }
        case 'GG4L':
          if (excludeProfile) {
            return this.http.get(constructUrl(`v1/schools/${this.http.getSchool().id}/gg4l_users`, {
              search: search,
              profile: excludeProfile
            }));
          } else {
            return this.http.get(constructUrl(`v1/schools/${this.http.getSchool().id}/gg4l_users`, {
              search
            }));
          }
      }
  }

  setUserActivityRequest(profile, active: boolean, role: string) {
    this.store.dispatch(updateAccountActivity({profile, active, role}));
    return of(null);
  }

  setUserActivity(id, activity: boolean) {
      return this.http.patch(`v1/users/${id}/active`, {active: activity});
  }

  addAccountRequest(school_id, user, userType, roles: string[], role, behalf?: User[]) {
    this.store.dispatch(postAccounts({school_id, user, userType, roles, role, behalf}));
    return of(null);
  }

  addAccountToSchool(id, user, userType: string, roles: Array<string>) {
    if (userType === 'gsuite') {
      return this.http.post(`v1/schools/${id}/add_user`, {
        type:  'gsuite',
        email: user.email,
        profiles: roles
      });
    } else if (userType === 'email') {
      return this.http.post(`v1/schools/${id}/add_user`, {
        type:  'email',
        email: user.email,
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name,
        profiles: roles
      });
    } else if (userType === 'username') {
        return this.http.post(`v1/schools/${id}/add_user`, {
            type: 'username',
            username: user.email,
            password: user.password,
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
            profiles: roles
        });
    }
  }

  addUserToProfileRequest(user, role) {
    this.store.dispatch(addUserToProfile({user, role}));
    return of(null);
  }

  addUserToProfile(id, role) {
    return this.http.put(`v1/users/${id}/profiles/${role}`);
  }

  createUserRolesRequest(profile, permissions, role) {
    this.store.dispatch(updateAccountPermissions({profile, permissions, role}));
    return of(null);
  }

  createUserRoles(id, data) {
    return this.http.patch(`v1/users/${id}/roles`, data);
  }

  deleteUserRequest(id, role) {
    this.store.dispatch(removeAccount({id, role}));
    return of(null);
  }

  deleteUser(id) {
      return this.http.delete(`v1/users/${id}`);
  }
  deleteUserFromProfile(id, role) {
      return this.http.delete(`v1/users/${id}/profiles/${role}`);
  }

  getRepresentedUsers(id) {
    return this.http.get(`v1/users/${id}/represented_users`);
  }

  addRepresentedUserRequest(profile, user: User) {
    this.store.dispatch(addRepresentedUserAction({profile, user}));
    return of(null);
  }

  addRepresentedUser(id: number, repr_user: User) {
    return this.http.put(`v1/users/${id}/represented_users/${repr_user.id}`);
  }

  deleteRepresentedUserRequest(profile, user: User) {
    this.store.dispatch(removeRepresentedUserAction({profile, user}));
    return of(null);
  }

  deleteRepresentedUser(id: number, repr_user: User) {
    return this.http.delete(`v1/users/${id}/represented_users/${repr_user.id}`);
  }

  getStudentGroupsRequest() {
    this.store.dispatch(getStudentGroups());
    return this.studentGroups$;
  }

  getStudentGroups() {
      return this.http.get('v1/student_lists');
  }

  createStudentGroupRequest(group) {
    this.store.dispatch(postStudentGroup({group}));
    return this.currentStudentGroup$;
  }

  createStudentGroup(data) {
      return this.http.post('v1/student_lists', data);
  }

  updateStudentGroupRequest(id, group) {
    this.store.dispatch(updateStudentGroup({id, group}));
    return this.currentStudentGroup$.pipe(filter(sg => !!sg));
  }

  updateStudentGroup(id, body) {
      return this.http.patch(`v1/student_lists/${id}`, body);
  }

  deleteStudentGroupRequest(id) {
    this.store.dispatch(removeStudentGroup({id}));
    return this.currentStudentGroup$;
  }

  deleteStudentGroup(id) {
      return this.http.delete(`v1/student_lists/${id}`);
  }

  getUserWithTimeout(max: number = 10000): Observable<User | null> {
    return race<User | null>(
      this.userData,
      interval(max).pipe(map(() => null))
    ).pipe(take(1));
  }

  getAccountsRoles(role: string = '', search: string = '', limit: number = 0) {
    this.store.dispatch(getAccounts({role, search, limit}));
    return this.getAccountsRole(role);
  }

  getUsersList(role: string = '', search: string = '', limit: number = 0, include_numbers?: boolean) {
    const params: any = {};
    if (role !== '' && role !== '_all') {
      params.role = role;
    }

    if (search !== '') {
      params.search = search;
    }
    if (limit) {
      params.limit = limit;
    }
    if (include_numbers) {
      params.include_numbers = true;
    }

    return this.http.get<any>(constructUrl('v1/users', params));
  }

  getMoreUserListRequest(role) {
    this.store.dispatch(getMoreAccounts({role}));
    return this.lastAddedAccounts$[role];
  }

  exportUserData(id) {
    return this.http.get(`v1/users/${id}/export_data`);
  }

  checkUserEmail(email) {
    return this.http.post('v1/check-email', {email});
  }

  addBulkAccountsRequest(accounts) {
    this.store.dispatch(bulkAddAccounts({accounts}));
    return of(null);
  }

  addBulkAccounts(accounts) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    return this.http.post('v1/users/bulk-add?should_commit=true', accounts, httpOptions, false);
  }

  sortTableHeaderRequest(role, queryParams) {
    this.store.dispatch(sortAccounts({role, queryParams}));
  }

  sortTableHeader(queryParams) {
    return this.http.get(constructUrl('v1/users', queryParams));
  }

  sendTestNotification(userId) {
    return this.http.post(`v1/users/${userId}/test_notification`, new Date());
  }

  updateEffectiveUser(effectiveUser) {
    this.store.dispatch(updateEffectiveUser({effectiveUser}));
  }

  clearRepresentedUsers() {
    this.store.dispatch(clearRUsers());
  }

  createUploadGroup() {
    return this.http.post(`v1/file_upload_groups`);
  }

  postProfilePicturesRequest(userIds: string[] | number[], pictures: File[]) {
    this.store.dispatch(postProfilePictures({pictures, userIds}));
    return this.profiles$;
  }

  uploadProfilePictures(image_files, user_ids, group_id?) {
    const data = group_id ? {image_files, user_ids, group_id, commit: true} : {image_files, user_ids, commit: true};
    return this.http.post(`v1/schools/${this.http.getSchool().id}/attach_profile_pictures`, data);
  }

  bulkAddProfilePictures(files: File[]) {
    const file_names = files.map(file => file.name);
    const content_types = files.map(file => file.type ? file.type : 'image/jpeg');
    return this.http.post('v1/file_uploads/bulk_create_url', {file_names, content_types});
  }

  setProfilePictureToGoogle(url: string, file: File, content_type: string) {
    const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': content_type
        })
      };
    return this.httpClient.put(url, file, httpOptions);
  }

  addProfilePictureRequest(profile: User, role: string, file: File) {
    this.store.dispatch(updateAccountPicture({profile, role, file}));
  }

  addProfilePicture(userId, file: File) {
    return this.http.patch(`v1/users/${userId}/profile-picture`, {profile_picture: file});
  }

  updateTeacherLocations(teacher, locations, newLocations) {
    this.store.dispatch(updateTeacherLocations({teacher, locations, newLocations}));
  }

  putProfilePicturesErrorsRequest(errors) {
    this.store.dispatch(putUploadErrors({errors}));
  }

  putProfilePicturesErrors(uploadedGroupId, levels: string[], messages: string[]) {
    return this.http.put(`v1/file_upload_groups/${uploadedGroupId}/events`, {levels, messages});
  }

  getUploadedGroupsRequest() {
    this.store.dispatch(getProfilePicturesUploadedGroups());
  }

  getUploadedGroups() {
    return this.http.get(`v1/file_upload_groups`);
  }

  getMissingProfilePicturesRequest() {
    this.store.dispatch(getMissingProfilePictures());
  }

  getMissingProfilePictures() {
    return this.http.get(`v1/users?role=_profile_student&has_picture=false`);
  }

  getUploadedErrorsRequest(group_id) {
    this.store.dispatch(getUploadedErrors({group_id}));
    return this.profilePicturesUploadErrors$;
  }

  getUploadedErrors(group_id) {
    return this.http.get(`v1/file_upload_groups/${group_id}/events`);
  }

  clearProfilePicturesErrors() {
    this.store.dispatch(clearProfilePicturesUploadErrors());
  }

  clearCurrentUpdatedAccounts() {
    this.store.dispatch(clearCurrentUpdatedAccount());
  }

  deleteProfilePicture(user: User, role: string) {
    this.store.dispatch(deleteProfilePicture({user, role}));
    return this.currentUpdatedAccount$[role];
  }

  clearUploadedData() {
    this.store.dispatch(clearUploadedData());
  }

  getUserStatsRequest(userId, queryParams?) {
    return this.store.dispatch(getStudentStats({userId, queryParams}));
  }

  getUserStats(userId: string | number, queryParams) {
    return this.http.get(constructUrl(`v1/users/${userId}/stats`, queryParams));
  }

  getNuxRequest() {
    this.store.dispatch(getNuxAction());
  }

  getNux() {
    return this.http.get('v1/nux');
  }
}
