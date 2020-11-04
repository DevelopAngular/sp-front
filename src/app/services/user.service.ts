import {ErrorHandler, Injectable} from '@angular/core';
import {interval, Observable, of, race, ReplaySubject} from 'rxjs';
import { SentryErrorHandler, setUserContext } from '../error-handler';
import {HttpService} from './http-service';
import {constructUrl} from '../live-data/helpers';
import {Logger} from './logger.service';
import {User} from '../models/User';
import {PollingService} from './polling-service';
import {filter, map, mapTo, switchMap, take, tap} from 'rxjs/operators';
import {Paged} from '../models';
import {School} from '../models/School';
import {RepresentedUser} from '../navbar/navbar.component';
import {Store} from '@ngrx/store';
import {AppState} from '../ngrx/app-state/app-state';
import {
  addUserToProfile,
  bulkAddAccounts,
  getAccounts,
  getMoreAccounts,
  postAccounts,
  removeAccount,
  sortAccounts,
  updateAccountActivity,
  updateAccountPermissions
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
  getAdminsAccountsEntities,
  getAdminsCollections,
  getAdminSort,
  getCountAdmins,
  getLastAddedAdminsAccounts,
  getLoadedAdminsAccounts,
  getLoadingAdminsAccounts,
  getNextRequestAdminsAccounts
} from '../ngrx/accounts/nested-states/admins/states/admins.getters.state';
import {
  getCountTeachers,
  getLastAddedTeachers,
  getLoadedTeachers,
  getLoadingTeachers,
  getNextRequestTeachers,
  getTeacherAccountsCollection,
  getTeachersAccountsEntities,
  getTeacherSort
} from '../ngrx/accounts/nested-states/teachers/states/teachers-getters.state';
import {
  getAssistantsAccountsCollection,
  getAssistantsAccountsEntities,
  getAssistantSort,
  getCountAssistants,
  getLastAddedAssistants,
  getLoadedAssistants,
  getLoadingAssistants,
  getNextRequestAssistants
} from '../ngrx/accounts/nested-states/assistants/states';
import {
  getCountStudents,
  getLastAddedStudents,
  getLoadedStudents,
  getLoadingStudents,
  getNextRequestStudents,
  getStudentsAccountsCollection,
  getStudentsAccountsEntities,
  getStudentSort
} from '../ngrx/accounts/nested-states/students/states';
import {getStudentGroups, postStudentGroup, removeStudentGroup, updateStudentGroup} from '../ngrx/student-groups/actions';
import {StudentList} from '../models/StudentList';
import {
  getCurrentStudentGroup,
  getLoadedGroups,
  getLoadingGroups,
  getStudentGroupsCollection
} from '../ngrx/student-groups/states/groups-getters.state';
import {getLoadedUser, getSelectUserPin, getUserData} from '../ngrx/user/states/user-getters.state';
import {clearUser, getUser, getUserPinAction, updateUserAction} from '../ngrx/user/actions';
import {addRepresentedUserAction, removeRepresentedUserAction} from '../ngrx/accounts/nested-states/assistants/actions';
import {HttpHeaders} from '@angular/common/http';
import {getIntros, updateIntros} from '../ngrx/intros/actions';
import {getIntrosData} from '../ngrx/intros/state';

@Injectable()
export class UserService {

  public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

  /**
  * Used for acting on behalf of some teacher by his assistant
  */
  public effectiveUser: ReplaySubject<RepresentedUser> = new ReplaySubject<RepresentedUser>(1);
  public representedUsers: ReplaySubject<RepresentedUser[]> = new ReplaySubject<RepresentedUser[]>(1);

  /**
   * Users from store
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

  user$: Observable<User> = this.store.select(getUserData);
  userPin$: Observable<string | number> = this.store.select(getSelectUserPin);
  loadedUser$: Observable<boolean> = this.store.select(getLoadedUser);

  studentGroups$: Observable<StudentList[]> = this.store.select(getStudentGroupsCollection);
  currentStudentGroup$: Observable<StudentList> = this.store.select(getCurrentStudentGroup);
  isLoadingStudentGroups$: Observable<boolean> = this.store.select(getLoadingGroups);
  isLoadedStudentGroups$: Observable<boolean> = this.store.select(getLoadedGroups);

  introsData$: Observable<any> = this.store.select(getIntrosData);

  constructor(
    private http: HttpService,
    private pollingService: PollingService,
    private _logging: Logger,
    private store: Store<AppState>,
  ) {
    this.http.globalReload$
        .pipe(
          tap(() => {
            this.http.effectiveUserId.next(null);
            this.effectiveUser.next(null);
          }),
          switchMap(() => {
            return this.getUserRequest().pipe(filter(res => !!res));
          }),
          map(raw => User.fromJSON(raw)),
          switchMap((user: User) => {
            if (user.isAssistant()) {
              return this.getUserRepresented()
                .pipe(
                  map((users: RepresentedUser[]) => {
                    const normalizedRU = users.map((raw) => {
                      raw.user = User.fromJSON(raw.user);
                      return raw;
                    });
                    if (users && users.length) {
                      this.representedUsers.next(normalizedRU);
                      this.effectiveUser.next(normalizedRU[0]);
                      this.http.effectiveUserId.next(+normalizedRU[0].user.id);
                    }
                    return user;
                  }));
            } else {
                this.representedUsers.next(null);
                this.effectiveUser.next(null);
                this.http.effectiveUserId.next(null);
              return of(user);
            }
          }),
          switchMap(user => {
            if (user.isTeacher() && !user.isAssistant()) {
              return this.getUserPinRequest().pipe(mapTo(user));
            } else {
              return of(user);
            }
          })
        )
        .subscribe(user => {
          this.userData.next(user);
        });

    this.userData.subscribe(user => {
      setUserContext({
        id: `${user.id}`,
        email: user.primary_email,
        is_student: user.isStudent(),
        is_teacher: user.isTeacher(),
        is_admin: user.isAdmin(),
      });
    });

    this.pollingService.listen().subscribe(this._logging.debug);
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
    return this.user$;
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

  updateIntros(device, version) {
    return this.http.patch('v1/intros/main_intro', {device, version});
  }

  updateIntrosReferral(device, version) {
    return this.http.patch('v1/intros/referral_reminder', {device, version});
  }

  saveKioskModeLocation(locId) {
    return this.http.post('auth/kiosk', {location: locId});
  }

  getUserRepresented() {
     return this.http.get<RepresentedUser[]>('v1/users/@me/represented_users');
  }

  getUserNotification() {
    return this.http.get('v1/users/@me/notification_settings');
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

  searchUserByCardId(id): Observable<User[]> {
    return this.http.get(constructUrl('v1/users', {search: id}));
  }

  searchProfileAll(search, type: string = 'alternative', excludeProfile?: string) {

      switch (type) {
        case 'alternative':
          return this.http.get(constructUrl(`v1/users`, {search: search}), );
        case 'G Suite':
          if (excludeProfile) {
            return this.http.get(constructUrl(`v1/schools/${this.http.getSchool().id}/gsuite_users`, {
              search: search,
              profile: excludeProfile
            }));
          } else {
            return this.http.get(constructUrl(`v1/schools/${this.http.getSchool().id}/gsuite_users`, {
              search: search
            }));
          }
        case 'GG4L':
          return this.http.currentSchool$.pipe(
            take(1),
            switchMap((currentSchool: School) => {
              if (excludeProfile) {
                return this.http.get(constructUrl(`v1/schools/${currentSchool.id}/gg4l_users`, {
                  search: search,
                  profile: excludeProfile
                }));
              } else {
                return this.http.get(constructUrl(`v1/schools/${currentSchool.id}/gg4l_users`, {
                  search
                }));
              }
            })
          );
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

  getUsersList(role: string = '', search: string = '', limit: number = 0) {
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
}
