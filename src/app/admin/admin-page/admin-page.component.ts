import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { catchError, concatMap, delay, exhaustMap, filter, map, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { HttpService } from '../../services/http-service';
import { FeatureFlagService, FLAGS } from '../../services/feature-flag.service';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/User';

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
		private adminService: AdminService,
		private featureFlags: FeatureFlagService
	) {
		this.userService.currentUpdatedUser$
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

		this.httpService.schoolsLoaded$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
			window.appLoaded();
		});

		this.userService.currentUpdatedUser$
			.pipe(
				takeUntil(this.destroy$),
				filter(Boolean),
				concatMap(() => {
					if (!this.featureFlags.isFeatureEnabled(FLAGS.RenewalChecklist)) {
						return of(false);
					}

					return this.isAdminUpForRenewal$();
				})
			)
			.subscribe({
				next: (show) => {
					if (this.router.url === '/admin/teacher-reviews') {
						return;
					}

					if (show) {
						this.router.navigate(['admin', 'renewal']).then();
						return;
					}

					this.goToDefaultPage();
				},
			});
	}

	goToDefaultPage() {
		of(location.pathname.split('/'))
			.pipe(
				takeUntil<string[]>(this.destroy$),
				map((fragments) => fragments.filter((f) => !!f?.length)),
				take(1),
				exhaustMap(() => this.userService.currentUpdatedUser$.pipe(take(1))),
				filter<User>(Boolean)
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
	}

	isAdminUpForRenewal$(): Observable<boolean> {
		const intros$ = this.userService.introsData$.pipe(
			filter((i) => !!i),
			take(1)
		);
		const checkRenewal$ = forkJoin([this.adminService.getRenewalData(), intros$]).pipe(
			take(1),
			map(([resp, intros]) => {
				const show = resp.renewal_status == 'expiring' || !intros.seen_renewal_status_page?.universal?.seen_version;
				return { intros, show };
			}),
			tap(({ intros, show }) => {
				if (show && !intros.seen_renewal_status_page?.universal?.seen_version) {
					this.userService.updateIntrosSeenRenewalStatusPageRequest(intros, 'universal', '1');
				}
			}),
			map(({ show }) => show),
			catchError(() => of(false))
		);

		return this.httpService.currentSchool$.pipe(
			filter((s) => !!s),
			switchMap((s) => {
				if (s.trial_end_date) {
					return of(false);
				} else {
					return checkRenewal$;
				}
			})
		);
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

	public hideOutlet(event: boolean): void {
		this.outletDummySwitcher$.next(event);
	}
}
