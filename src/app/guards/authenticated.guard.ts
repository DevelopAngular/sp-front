import { Injectable } from '@angular/core';
import { httpFactory } from '@angular/http/src/http_module';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GoogleLoginService } from '../google-login.service';
import { HttpService } from '../http-service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

  constructor(private loginService: GoogleLoginService, private httpService: HttpService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // isAuthenticated won't necessarily be changed until an access token is needed because the authentication
    // flow is lazy. We need to force it to execute so that it will update.
    this.httpService.accessToken.subscribe();

    // we don't actually want to cancel routing this path, we want to wait until isAuthenticated$ becomes true.
    return this.loginService.isAuthenticated$.do(v => console.log('is authenticated (guard):', v)).filter(v => v);
}

}
