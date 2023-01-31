import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class IsParentGuard implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.userService.getUserWithTimeout().pipe(
			map((u) => {
				if (!u) {
					return false;
				}

				if (u.isParent()) {
					return true;
				} else {
					this.router.navigate(['']);
					return false;
				}
			})
		);
	}
}
