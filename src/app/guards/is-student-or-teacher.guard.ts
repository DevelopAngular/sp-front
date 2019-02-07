import { Injectable, NgZone } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class IsStudentOrTeacherGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private _zone: NgZone) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.userService.getUserWithTimeout()
      .map(u => {
        // console.log('USER >>>>>>>>>>>>>>', u);

        if (u === null) {
          return false;
        }

        if (u.isAdmin() && !(u.isStudent() || u.isTeacher())) {
          console.log('SeaB');

          this._zone.run(() => {
            this.router.navigate(['admin']);
          });
        }

        console.log('SeaC');

        return true;
      })
      .do(v => console.log('canActivate:', v));
  }
}
