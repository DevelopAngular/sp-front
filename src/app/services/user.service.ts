import { Injectable } from '@angular/core';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import { interval } from 'rxjs/observable/interval';
import { race } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpService } from './http-service';
import { constructUrl } from '../live-data/helpers';
import { Logger } from './logger.service';
import { User } from '../models/User';
import { PollingService } from './polling-service';
import {AdminService} from './admin.service';
import {map, switchMap} from 'rxjs/operators';
import {Paged} from '../models';

@Injectable()
export class UserService {

  public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(
      private http: HttpService,
      private pollingService: PollingService,
      private _logging: Logger
  ) {

    // this.userData.subscribe(
    //   u => console.log('next user:', u),
    //   e => console.log('user error:', e),
    //   () => console.log('userData complete'));

    this.http.globalReload$
        .pipe(switchMap(() => this.getUser()), map(raw => User.fromJSON(raw)))
      .subscribe(user => this.userData.next(user));

    this.pollingService.listen().subscribe(this._logging.debug);
  }

  getUser() {
     return this.http.get<User>('v1/users/@me');
  }

  searchProfile(role, limit = 5, search) {
      return this.http.get<Paged<any>>(`v1/users?role=${role}&limit=${limit}&search=${search}`);
  }

  searchProfileAll(search) {
      return this.http.get(`v1/users?search=${search}`);
  }

  addUserToProfile(id, role) {
      return this.http.put(`v1/users/${id}/profiles/${role}`);
  }

  createUserRoles(id, data) {
    return this.http.post(`v1/users/${id}/roles`, data);
  }

  deleteUserFromProfile(id, role) {
      return this.http.delete(`v1/users/${id}/profiles/${role}`);
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
      interval(max).map(() => null)
    ).take(1);
  }

  getUsersList(role: string = '', search: string = '') {

    const params: any = {};
    if (role !== '') {
      params.role = role;
    }

    if (search !== '') {
      params.search = search;
    }

    return this.http.get<any>(constructUrl('v1/users', params));
  }

}
