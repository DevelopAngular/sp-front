import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { delay, exhaustMap, filter, map, skip, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpService } from '../../services/http-service';
import { CheckForUpdateService } from '../../services/check-for-update.service';
import { School } from '../../models/School';
import * as moment from 'moment/moment';
import { FormControl, FormGroup } from '@angular/forms';
import { filter as _filter } from 'lodash';

declare const window;

@Component({
	selector: 'app-admin-page',
	templateUrl: './admin-page.component.html',
	styleUrls: ['./admin-page.component.scss'],
	host: {
		class: 'root-router-child',
	},
})
export class AdminPageComponent implements OnInit, AfterViewInit, OnDestroy {
	private outletDummySwitcher$ = new BehaviorSubject<boolean>(false);
	private adminPageReload$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	public hostVisibility: boolean = true;
	public showDummySwitcher$: Observable<boolean>;
	public schoolsLength$: Observable<number>;
	private destroy$: Subject<any> = new Subject<any>();

	constructor(
		private router: Router,
		private userService: UserService,
		private httpService: HttpService,
		private updateService: CheckForUpdateService
	) {
		this.userService.userData
			.pipe(
				takeUntil(this.destroy$),
				filter((user) => !user.isAdmin() && user.isTeacher())
			)
			.subscribe((user) => {
				window.waitForAppLoaded();
				this.goHome(user);
			});
	}

	public ngOnInit(): void {
		this.schoolsLength$ = this.httpService.schoolsLength$;

		this.adminPageReload$
			.pipe(
				takeUntil(this.destroy$),
				skip(1),
				tap(() => {
					this.hostVisibility = false;
				}),
				delay(10)
			)
			.subscribe((v) => {
				this.outletDummySwitcher$.next(false);
				this.hostVisibility = true;
			});

		of(location.pathname.split('/'))
			.pipe(
				takeUntil(this.destroy$),
				map((fragments) => fragments.filter((f) => !!f)),
				filter((value) => {
					if (environment.production) {
						return value.length < 3;
					} else {
						return value.length < 2;
					}
				}),
				take(1),
				exhaustMap(() => this.userService.user$.pipe(take(1))),
				filter((user) => !!user)
			)
			.subscribe((user) => {
				const availableAccessTo = user.roles.filter((_role) => _role.match('access_'));
				let tab;
				if (availableAccessTo.includes('access_admin_dashboard')) {
					tab = 'dashboard';
				} else if (availableAccessTo.includes('access_hall_monitor')) {
					tab = 'hallmonitor';
				} else if (availableAccessTo.includes('access_admin_search')) {
					tab = 'search';
				} else if (availableAccessTo.includes('access_pass_config')) {
					tab = 'passconfig';
				} else if (availableAccessTo.includes('access_user_config')) {
					tab = 'accounts';
				}
				this.router.navigate(['admin', tab]);
			});

		this.httpService.schoolsLoaded$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
			window.appLoaded();
		});
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public ngAfterViewInit(): void {
		window.appLoaded();
	}

	public onReloadPage(event): void {
		this.adminPageReload$.next(true);
	}

	private goHome(user): void {
		if (user) {
			if (user.isStudent() || user.isTeacher()) {
				this.router.navigate(['/main']);
				return;
			}
		}
		this.router.navigate(['/sign-out']);
	}

	public hideOutlet(event: boolean): void  {
		this.outletDummySwitcher$.next(event);
	}
}
