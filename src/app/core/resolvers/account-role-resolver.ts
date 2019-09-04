import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {User} from '../../models/User';
import {of} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {UserService} from '../../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AccountRoleResolver implements Resolve<User[]> {

  constructor(
    private userService: UserService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    const role = route.params.role;
    return of(navigator.onLine)
      .pipe(switchMap(connect => {
          if (connect) {
              return this.userService.getAccountsRoles(role);
          } else {
              return this.userService.getAccountsRole(role);
          }
        }),
        take(1));
  }
}
