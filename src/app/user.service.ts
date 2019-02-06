import { ErrorHandler, Injectable } from '@angular/core';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import { interval } from 'rxjs/observable/interval';
import { race } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { SentryErrorHandler } from './error-handler';
import { HttpService } from './http-service';
import { constructUrl } from './live-data/helpers';
import { Logger } from './logger.service';
import { User } from './models/User';
import { PollingService } from './polling-service';

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
      .switchMap(() => this.http.get<any>('v1/users/@me'))
      .map(raw => User.fromJSON(raw))
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

  getUserWithTimeout(max: number = 10000): Observable<User | null> {
    return race<User | null>(
      this.userData,
      interval(max).map(() => null)
    ).take(1);
  }

  getUsersList(role: string = '', search: string = '') {
    console.log('usr', this);

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
