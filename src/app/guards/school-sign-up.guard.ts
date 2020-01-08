import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {GoogleLoginService} from '../services/google-login.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolSignUpGuard implements CanActivate {

  constructor(private loginService: GoogleLoginService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.loginService.isAuthenticated$.pipe(isAuthenticated => {
        return isAuthenticated;
    });
  }
}
