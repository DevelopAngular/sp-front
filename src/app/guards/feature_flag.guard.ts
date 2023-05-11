import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';
import { DeviceDetection } from '../device-detection.helper';
import { FeatureFlagService } from '../services/feature-flag.service';

@Injectable({
	providedIn: 'root',
})
export class FeatureFlagGuard implements CanActivate {
	constructor(private featureFlagService: FeatureFlagService, private userService: UserService, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean {
		return this.userService.userData.pipe(
			map((user) => {
				const isFeatureEnabled = this.featureFlagService.isFeatureEnabled(next.data.feature_flag);
				if (!isFeatureEnabled) {
					console.log('Feature not accessible!');
					const homeRedirectCommands =
						!user.isAdmin() || (user.isAdmin() && user.isTeacher() && DeviceDetection.isMobile()) ? ['main', 'passes'] : ['admin', 'dashboard'];
					return this.router.createUrlTree(homeRedirectCommands);
				}

				return true;
			})
		);
	}
}
