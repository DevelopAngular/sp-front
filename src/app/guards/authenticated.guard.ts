import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {GoogleLoginService} from '../services/google-login.service';
import {map, tap, withLatestFrom} from 'rxjs/operators';
import {StorageService} from '../services/storage.service';
import {AllowMobileService} from '../services/allow-mobile.service';
import {ToastService} from '../services/toast.service'

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

  constructor(
    private loginService: GoogleLoginService,
    private router: Router,
    private storage: StorageService,
    private allowMobile: AllowMobileService,
    private toast: ToastService,
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
        map(([isAuthenticated, studentAllowMobile]) => {
          console.log('guard',isAuthenticated, studentAllowMobile)
          if (!isAuthenticated) {
            this.router.navigate(['']);
          } else {
            if (this.storage.getItem('gg4l_invalidate')) {
              this.storage.removeItem('gg4l_invalidate');
            }
            if (!studentAllowMobile) {
              this.allowMobile.clearInternal();
              //this.router.navigate(['sign-out']);
              this.toast.openToast({
                title: 'Success!',
                subtitle: 'mobile devices not allowed',
                type: 'success',
              });
            }
          }
          return isAuthenticated;
        })
      );
}

}
