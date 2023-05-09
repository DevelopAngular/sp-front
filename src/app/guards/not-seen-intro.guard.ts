import { ErrorHandler, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, zip } from 'rxjs';
import { UserService } from '../services/user.service';
import { combineLatest, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { User } from '../models/User';
import { StorageService } from '../services/storage.service';
import { DeviceDetection } from '../device-detection.helper';

@Injectable({
	providedIn: 'root',
})
export class NotSeenIntroGuard implements CanActivate {
	constructor(private router: Router, private userService: UserService, private errorHandler: ErrorHandler, private storage: StorageService) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.userService.user$.pipe(
			filter(Boolean),
			tap(() => this.userService.getIntrosRequest()),
			map((raw) => {
				return User.fromJSON(raw);
			}),
			switchMap((user) => {
				return zip(of(user), this.userService.introsData$.pipe(filter(Boolean), take(1)));
			}),
			map(([user, intros]: [any, any]) => {
				if (!user) {
					return false;
				}
				let isSaveOnServer;
				if (DeviceDetection.isAndroid() && intros.main_intro.android.seen_version) {
					isSaveOnServer = true;
				} else if (DeviceDetection.isIOSMobile() && intros.main_intro.ios.seen_version) {
					isSaveOnServer = true;
				} else if (intros.main_intro.web.seen_version) {
					isSaveOnServer = true;
				}
				if (!isSaveOnServer && !user.isAdmin()) {
					this.router.navigateByUrl('intro').catch((e) => this.errorHandler.handleError(e));
				}
				return true;
			})
		);
	}
}
