import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KioskModeService } from './services/kiosk-mode.service';

@Injectable({
	providedIn: 'root',
})
export class NotKioskModeGuard implements CanActivate {
	constructor(private kioskMode: KioskModeService, private router: Router) {}
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | boolean {
		if (this.kioskMode.isKisokMode()) {
			return this.router.parseUrl('main/kioskMode');
		}

		return true;
	}
}
