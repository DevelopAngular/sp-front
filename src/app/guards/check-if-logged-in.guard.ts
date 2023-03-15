import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
	providedIn: 'root',
})
export class CheckIfLoggedInGuard implements CanActivate {
	constructor(private cookie: CookieService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (!!this.cookie.get('smartpassToken')) {
			this.router.navigate(['main']);
		}

		return true;
	}
}
