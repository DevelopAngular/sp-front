import { Injectable, NgZone } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { User } from '../models/User';

@Injectable({
	providedIn: 'root',
})
export class IsStudentOrTeacherGuard implements CanActivate {
	constructor(private userService: UserService, private router: Router, private _zone: NgZone, private storageService: StorageService) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.userService.getUser().pipe(
			map((u) => {
				if (u === null) {
					return false;
				}
				u = User.fromJSON(u);
				if (this.storageService.getItem('initialUrl')) {
					this.router.navigate([this.storageService.getItem('initialUrl')]);
					this.storageService.removeItem('initialUrl');
				}
				if (u.isAdmin() && !(u.isStudent() || u.isTeacher())) {
					if (/\/main\/student\/\d+/.test(state.url)) {
						try {
							this.storageService.setItem('admin_not_teacher_student_redirect', state.url.split('/').slice(-1)[0]);
							return true;
						} catch {
							return false;
						}
					}

					this._zone.run(() => {
						this.router.navigate(['admin']);
					});
				}
				return true;
			})
		);
	}
}
