import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {GoogleLoginService} from '../services/google-login.service';
import {HttpService} from '../services/http-service';
import {StorageService} from '../services/storage.service';
import {AllowMobileService} from '../services/allow-mobile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

  constructor(
    private loginService: GoogleLoginService,
    private httpService: HttpService,
    private router: Router,
    private storage: StorageService,
    private allowMobile: AllowMobileService,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // we don't actually want to cancel routing this path, we want to wait until isAuthenticated$ becomes true.
    return this.loginService.isAuthenticated$
      .pipe(
        tap(v => console.log('is authenticated (guard):', v)),
        withLatestFrom(this.allowMobile.canUseMobile$),
        // filter(v => v),
        map(([isAuthenticated, allowMobileDevice]) => {
          console.log(isAuthenticated, allowMobileDevice)
          if (!isAuthenticated) {
            this.router.navigate(['']);
          } else {
            if (this.storage.getItem('gg4l_invalidate')) {
              this.storage.removeItem('gg4l_invalidate');
            }
            if (!allowMobileDevice) {
              console.log(allowMobileDevice)
              // log out the user
              this.httpService.clearInternal();
              this.loginService.clearInternal();
              this.router.navigate(['login']);
            }
          }
          return isAuthenticated;
        })
      );
}

}
