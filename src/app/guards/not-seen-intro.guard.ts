import { ErrorHandler, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import {Observable, of} from 'rxjs';
import {UserService} from '../user.service';
import {map, tap} from 'rxjs/operators';
import {HttpService} from '../http-service';
import {User} from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class NotSeenIntroGuard implements CanActivate {

  constructor(
    private router: Router,
    private http: HttpService,
    private errorHandler: ErrorHandler
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('canActivate intro:', localStorage.getItem('smartpass_intro') !== 'seen');

    return this.http.get<any>('v1/users/@me')
      .pipe(
        map(raw => User.fromJSON(raw)),
        map((user) => {
        if (!user) {
          return false;
        }
        if (user.isStudent()) {
          if (localStorage.getItem('smartpass_intro_student') !== 'seen') {
            this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
          }
        } else if (user.isTeacher()) {
          if (localStorage.getItem('smartpass_intro_teacher') !== 'seen') {
            this.router.navigateByUrl('/main/intro').catch(e => this.errorHandler.handleError(e));
          }
        }
        return true;
      }),
      tap(() => console.log('======> OK'))
      );
  }
}
