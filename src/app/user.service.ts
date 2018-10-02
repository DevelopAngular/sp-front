import { Injectable } from '@angular/core';
import { GoogleAuthService } from 'ng-gapi';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpService } from './http-service';
import { Logger } from './logger.service';
import { User } from './models/User';
import { PollingService } from './polling-service';


@Injectable()
export class UserService {

  public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(private googleAuth: GoogleAuthService, private http: HttpService,
              private pollingService: PollingService, private _logging: Logger) {

    this.http.get<any>('api/methacton/v1/users/@me')
      .map(raw => User.fromJSON(raw))
      .subscribe(this.userData);

    this.pollingService.listen().subscribe(this._logging.debug);

  }

}
