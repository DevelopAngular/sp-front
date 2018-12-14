import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class IsStudentOrTeacherGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.userService.userData.map(u => {

      if (u.isAdmin() && !(u.isStudent() || u.isTeacher())) {
        this.router.navigate(['admin']);
      }

      return true;
    });
  }
}
