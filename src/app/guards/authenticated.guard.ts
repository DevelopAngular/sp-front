import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { AllowMobileService } from '../services/allow-mobile.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
	providedIn: 'root',
})
export class AuthenticatedGuard implements CanActivate {
	constructor(
    private router: Router,
    private storage: StorageService,
    private allowMobile: AllowMobileService,
    private cookie: CookieService
  ) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		// we don't actually want to cancel routing this path, we want to wait until isAuthenticated$ becomes true.
    const isAuth = !!this.cookie.get('smartpassToken')

		return of(isAuth).pipe(
			tap((v) => console.log('is authenticated (guard):', v)),
			withLatestFrom(this.allowMobile.canUseMobile$),
			// filter(v => v),
			map(([isAuthenticated, studentAllowMobile]) => {
				if (!isAuthenticated) {
					const path = window.location.pathname;
					if (path.includes('parent')) {
						this.router.navigate(['auth']);
					} else {
						this.router.navigate(['']);
					}
				} else {
					if (this.storage.getItem('gg4l_invalidate')) {
						this.storage.removeItem('gg4l_invalidate');
					}

					this.storage.setItem('studentAllowMobile', studentAllowMobile);
					if (!studentAllowMobile) {
						this.router.navigate(['/mobile-restriction']);
					}
				}
        return isAuthenticated;
			})
		);
	}
}
