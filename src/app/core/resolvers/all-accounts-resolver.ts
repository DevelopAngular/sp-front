import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { User } from '../../models/User';
import {Observable, of} from 'rxjs';
import {UserService} from '../../services/user.service';
import {switchMap, take} from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';

@Injectable({
  providedIn: 'root'
})
export class AllAccountsResolver implements Resolve<User[]> {

  constructor(private userService: UserService, private adminService: AdminService) { }

  resolve(): Observable<User[]> {
    return of(navigator.onLine)
      .pipe(switchMap(connect => {
        if (connect) {
          return this.userService.getAccountsRoles();
        } else {
          return this.userService.accounts.allAccounts;
        }
      }),
        take(1));
  }
}
