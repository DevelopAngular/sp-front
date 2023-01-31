import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { KioskModeService } from '../services/kiosk-mode.service';

@Injectable({
	providedIn: 'root',
})
export class KioskSettingsGuard implements CanActivate {
	constructor(private router: Router, private kioskMode: KioskModeService) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		if (this.router.url === '/main/myroom' || this.kioskMode.getCurrentRoom().value) {
			return true;
		}
		this.router.navigate(['main/myroom']); // Navigate away to some other page
		return false;
	}
}
