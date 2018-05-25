import { Injectable } from '@angular/core';
import { GoogleAuthService } from 'ng-gapi';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpService } from './http-service';
import { User } from './NewModels';


@Injectable()
export class UserService {

  public userData: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(private googleAuth: GoogleAuthService, private http: HttpService) {

    this.http.get<any>('api/methacton/v1/users/@me')
      .map(raw => User.fromJSON(raw))
      .subscribe(this.userData);
  }

}
