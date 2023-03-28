import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

import { combineLatest } from 'rxjs';

// TODO: Need to decide if this component should live in the auth folder
@Component({
	selector: 'app-auth-guard-callback',
	template: '',
})
export class AuthGuardCallbackComponent implements OnInit {
	constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) {
		combineLatest(userService.loadedUser$, route.data, route.queryParams).subscribe(([loadedUser, routeData, queryParams]) => {
			if (loadedUser) {
				router.navigate(routeData.url, {
					state: {
						...routeData['pass_through'],
						...queryParams,
					},
					queryParams: routeData.pass_through_query_params,
				});
			} else {
				router.navigate([''], {
					state: {
						callbackUrl: router.url,
					},
				});
			}
		});
	}

	ngOnInit(): void {}
}
