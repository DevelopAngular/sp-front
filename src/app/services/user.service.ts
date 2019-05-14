import { ErrorHandler, Injectable } from '@angular/core';





import {interval, race, Observable, ReplaySubject, of} from 'rxjs';
import { SentryErrorHandler } from '../error-handler';
import { HttpService } from './http-service';
import { constructUrl } from '../live-data/helpers';
import { Logger } from './logger.service';
import { User } from '../models/User';
import { PollingService } from './polling-service';
import {AdminService} from './admin.service';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {Paged} from '../models';
import {School} from '../models/School';
import {RepresentedUser} from '../navbar/navbar.component';

@Injectable()
export class UserService {

  public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(private http: HttpService,
              private pollingService: PollingService,
              private _logging: Logger,
              private errorHandler: ErrorHandler) {

    // this.userData.subscribe(
    //   u => console.log('next user:', u),
    //   e => console.log('user error:', e),
    //   () => console.log('userData complete'));

    this.http.globalReload$
        .pipe(
          switchMap(() => this.getUser()), map(raw => User.fromJSON(raw)),
          // switchMap((user: User) => {
          //   if (user.isAssistant()) {
          //     return this.getUserRepresented().pipe(map((users: RepresentedUser[]) => {
          //       if (users && users.length) {
          //         this.http.effectiveUserId.next(+users[0].user.id);
          //       }
          //       return user;
          //     }));
          //   } else {
          //     return of(user);
          //   }
          // })
        )
        .subscribe(user => this.userData.next(user));

          if (errorHandler instanceof SentryErrorHandler) {
            this.userData.subscribe(user => {
              errorHandler.setUserContext({
                id: `${user.id}`,
                email: user.primary_email,
                is_student: user.isStudent(),
                is_teacher: user.isStudent(),
                is_admin: user.isAdmin(),
              });
            });
          }

    this.pollingService.listen().subscribe(this._logging.debug);
  }

  getUser() {
     return this.http.get<User>('v1/users/@me');
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
      return this.http.get<Paged<any>>(`v1/users?${role ? `role=${role}&` : ``}limit=${limit}&search=${search}`);
  }

  searchProfileById(id) {
      return this.http.get<User>(`v1/users/${id}`);
  }

  searchProfileAll(search, type: string = 'alternative') {
      switch (type) {
        case 'alternative':
          return this.http.get(`v1/users?search=${search}`);
        case 'gsuite':
          return this.http.currentSchool$.pipe(
            take(1),
            switchMap((currentSchool: School) => {
              return this.http.get(`v1/schools/${currentSchool.id}/gsuite_users${search ? `?search=${search}` : ''}`);
            })
          );
      }
  }

  setUserActivity(id, activity: boolean) {
      return this.http.patch(`v1/users/${id}/active`, {active: activity});
  }

  addAccountToSchool(id, user, userType: string, roles: Array<string>) {
    if (userType === 'gsuite') {

      return this.http.post(`v1/schools/${id}/add_user`, {
        type:  'gsuite',
        email: user.email,
        profiles: roles
      });
    } else {

      return this.http.post(`v1/schools/${id}/add_user`, {
        type:  'email',
        email: user.email,
        profiles: roles
      });
    }
  }
  addUserToProfile(id, role) {
      return this.http.put(`v1/users/${id}/profiles/${role}`);
  }

  createUserRoles(id, data) {
    return this.http.patch(`v1/users/${id}/roles`, data);
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

  getUserWithTimeout(max: number = 10000): Observable<User | null> {
    return race<User | null>(
      this.userData,
      interval(max).pipe(map(() => null))
    ).pipe(take(1));
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
  exportUserData(id) {
    return this.http.get(`v1/users/${id}/export_data`);
  }
}
