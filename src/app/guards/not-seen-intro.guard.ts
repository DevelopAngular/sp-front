import { ErrorHandler, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/User';
import {StorageService} from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class NotSeenIntroGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandler,
    private storage: StorageService
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // console.log('canActivate intro:', localStorage.getItem('smartpass_intro') !== 'seen');

    return this.userService.getUser()
      .pipe(
        map(raw => User.fromJSON(raw)),
        map((user) => {
          if (!user) {
            return false;
          }
          if (user.isStudent()) {
            if (this.storage.getItem('smartpass_intro_student') !== 'seen') {
              this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
            }
          } else if (user.isTeacher()) {
            if (this.storage.getItem('smartpass_intro_teacher') !== 'seen') {
              this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
            }
          }
          return true;
        })
      );
    }
}
