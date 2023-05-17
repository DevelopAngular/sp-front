import { Injectable, NgZone } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { HttpService } from '../services/http-service';
import { map } from 'rxjs/operators';
import { User } from '../models/User';

@Injectable({
	providedIn: 'root',
})
export class IsTeacherOrAdminGuard implements CanActivate {
	constructor(private userService: UserService, private http: HttpService, private router: Router, private _zone: NgZone) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
		return this.userService.getUser().pipe(
			map((user) => {
				user = User.fromJSON(user);
				if (!(user.isTeacher() || user.isAdmin())) {
					return this.router.createUrlTree(['/main/passes']);
				}

				return true;
			})
		);
	}
}
