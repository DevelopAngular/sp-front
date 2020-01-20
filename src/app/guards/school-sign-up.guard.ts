import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {GoogleLoginService} from '../services/google-login.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SchoolSignUpGuard implements CanActivate {

  constructor(private loginService: GoogleLoginService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.loginService.isAuthenticated$
        .pipe(
          map(isAuthenticated => {
            if (isAuthenticated) {
              this.router.navigate(['/']);
            }
            return true;
          }));
  }
}
