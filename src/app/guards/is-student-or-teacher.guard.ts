import { Injectable, NgZone } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, race } from 'rxjs';
import { interval } from 'rxjs/observable/interval';
import { User } from '../models/User';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class IsStudentOrTeacherGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private _zone: NgZone) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('SeaA');

    return race<User | number>(
      this.userService.userData,
      interval(500)
    )
      .take(1)
      .map(u => {

        if (typeof u === 'number') {
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
