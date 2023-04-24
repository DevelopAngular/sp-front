import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/User';
import { ParentAccountService } from '../services/parent-account.service';

@Injectable({
	providedIn: 'root',
})
export class IsParentGuard implements CanActivate {
	constructor(private parentService: ParentAccountService, private router: Router) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.parentService.getParentInfo().pipe(
			map((u) => {
				const parsedUser: User = User.fromJSON(u);
				if (!parsedUser) {
					return false;
				}

				if (parsedUser.isParent()) {
					return true;
				} else {
					this.router.navigate(['']);
					return false;
				}
			})
		);
	}
}
