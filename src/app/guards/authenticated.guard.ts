import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { Observable } from 'rxjs';
import { GoogleLoginService } from '../services/google-login.service';
import { HttpService } from '../services/http-service';
import {map, tap} from 'rxjs/operators';
import {StorageService} from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

  constructor(
    private loginService: GoogleLoginService,
    private httpService: HttpService,
    private router: Router,
    private storage: StorageService
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // isAuthenticated won't necessarily be changed until an access token is needed because the authentication
    // flow is lazy. We need to force it to execute so that it will update.
    this.httpService.accessToken.subscribe();

    // we don't actually want to cancel routing this path, we want to wait until isAuthenticated$ becomes true.
    return this.loginService.isAuthenticated$
      .pipe(
        tap(v => console.log('is authenticated (guard):', v)),
        // filter(v => v),
        map((v) => {
          if (!v) {
            this.router.navigate(['']);
          } else {
            if (this.storage.getItem('gg4l_invalidate')) {
              this.storage.removeItem('gg4l_invalidate');
            }
          }
          return v;
        })
      );
}

}
