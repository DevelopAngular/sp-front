import {Injectable, NgZone} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../services/user.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IsStudentOrTeacherGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private _zone: NgZone) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.userService.getUserWithTimeout().pipe(
      map(u => {
        if (u === null) {
          return false;
        }
        if (u.isAdmin() && !(u.isStudent() || u.isTeacher())) {
          this._zone.run(() => {
            this.router.navigate(['admin']);
          });
        }
        return true;
      }));
  }
}
