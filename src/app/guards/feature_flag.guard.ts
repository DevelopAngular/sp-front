import { Inject, Injectable, NgZone } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';
import { DeviceDetection } from '../device-detection.helper';
import { StorageService } from '../services/storage.service';
import { FeatureFlagService, FLAGS } from '../services/feature-flag.service';

@Injectable({
	providedIn: 'root',
})
export class FeatureFlagGuard implements CanActivate {
	constructor(private featureFlagService: FeatureFlagService, private router: Router, private _zone: NgZone) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		if (!next.data.feature_flag) {
			console.log('missing feature_flag data for route!');
			return false;
		}
		return this.featureFlagService.isFeatureEnabled(next.data.feature_flag);
	}
}
