import { AfterViewInit, Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { exhaustMap, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ScreenService } from '../services/screen.service';
import { SideNavService } from '../services/side-nav.service';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { DataService } from '../services/data-service';
import { LiveDataService } from '../live-data/live-data.service';
import { Request } from '../models/Request';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { filter as _filter } from 'lodash';
import { HttpService } from '../services/http-service';
import { HallPassesService } from '../services/hall-passes.service';
import { User } from '../models/User';
import { StorageService } from '../services/storage.service';
import { KioskModeService } from '../services/kiosk-mode.service';

declare const window;

class School {}

const DEFAULT_NAVBAR_HEIGHT = '64px';
const HIDDEN_NAVBAR_HEIGHT = '0px';

@Component({
	selector: 'app-main-page',
	templateUrl: './main-page.component.html',
	styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, AfterViewInit, OnDestroy {
	public topPadding;

	inboxHasItems: Observable<boolean> = of(null);
	currentRequest$ = new BehaviorSubject<Request>(null);
	toggleLeft: Observable<boolean> = new Observable<boolean>();
	toggleRight: Observable<boolean> = new Observable<boolean>();
	sentRequests: any;
	receivedRequests: any;
	isStaff: boolean;
	data: any;
	navbarHeight = DEFAULT_NAVBAR_HEIGHT;
	restriction$: Observable<boolean>;
	schools: School[] = [];
	isKioskMode: boolean;
	isUpdateBar$: Subject<any>;

	private destroy$: Subject<any> = new Subject<any>();

	@HostListener('window:resize')
	checkWidth() {
		if (!this.screenService.isDeviceLargeExtra) {
			this.sideNavService.toggleLeft$.next(false);
			this.sideNavService.toggleRight$.next(false);
		}

		if (!this.screenService.isDeviceLargeExtra && this.screenService.isDeviceMid) {
			this.sideNavService.toggleRight$.next(false);
		}

		this.navbarHeight = this.currentNavbarHeight();
	}

	constructor(
		public userService: UserService,
		public darkTheme: DarkThemeSwitch,
		public screenService: ScreenService,
		private sideNavService: SideNavService,
		private dataService: DataService,
		private liveDataService: LiveDataService,
		private _zone: NgZone,
		private router: Router,
		private http: HttpService,
		private passesService: HallPassesService,
		private storage: StorageService,
		private kioskModeService: KioskModeService
	) {
		this.http.schoolsCollection$
			.pipe(
				takeUntil(this.destroy$),
				map((schools) => {
					return _filter(schools, (school) => school.my_roles.length > 0);
				})
			)
			.subscribe((schools) => {
				this.schools = schools;
			});

		this.restriction$ = this.userService.blockUserPage$;

		const dbUser$ = this.http.globalReload$.pipe(
			exhaustMap(() => {
				return this.userService.user$.pipe(
					filter((u) => !!u),
					take(1)
				);
			}),
			map((user) => User.fromJSON(user)),
			exhaustMap((user) => {
				this.isStaff = user.isTeacher() || user.isAdmin() || user.isAssistant();
				this.navbarHeight = this.currentNavbarHeight();
				if (user.isAssistant()) {
					return this.userService.effectiveUser.pipe(
						filter((u) => !!u),
						map((u) => User.fromJSON(u.user))
					);
				} else {
					return of(user);
				}
			})
		);

		this.http.globalReload$.subscribe(() => {
			this.passesService.getFiltersRequest('past-passes');
		});

		// TODO: WHY DO WE NEED THIS?
		combineLatest(
			dbUser$,
			this.passesService.passFilters$.pipe(
				filter((pass) => !!pass),
				take(1)
			)
		)
			.pipe(
				takeUntil(this.destroy$),
				tap(([user, filters]: [user: User, filters: any]) => {
					this.liveDataService.getActivePassesRequest(of({ sort: '-created', search_query: '' }), user);
					this.liveDataService.getPassLikeCollectionRequest(user);
					this.liveDataService.getExpiredPassesRequest(user, filters['past-passes'].default);
					this.liveDataService.getHallMonitorPassesRequest(of({ sort: '-created', search_query: '' }));
					if (user.roles.includes('hallpass_student')) {
						this.receivedRequests = this.liveDataService.invitations$;
						this.sentRequests = this.liveDataService.requests$;
					} else {
						this.receivedRequests = this.liveDataService.requests$;
						this.sentRequests = this.liveDataService.invitations$;
					}
				}),
				switchMap(([user]) => {
					return user.roles.includes('hallpass_student') ? this.liveDataService.watchActivePassLike(user) : of(null);
				})
			)
			.subscribe((passLike) => {
				this._zone.run(() => {
					this.currentRequest$.next(passLike instanceof Request ? passLike : null);
				});
			});
	}

	get titleColor() {
		return this.darkTheme.getColor({ dark: '#FFFFFF', white: '#1F195E' });
	}

	currentNavbarHeight() {
		const { url } = this.router;
		if (url.includes('kioskMode')) {
			return DEFAULT_NAVBAR_HEIGHT;
		}

		return (url === '/main/hallmonitor' && this.screenService.isDeviceLargeExtra) || (url === '/main/myroom' && this.screenService.isDeviceLargeExtra)
			? HIDDEN_NAVBAR_HEIGHT
			: DEFAULT_NAVBAR_HEIGHT;
	}

	get showInbox() {
		if (!this.isStaff) {
			return this.dataService.inboxState;
		} else if (!this.inboxHasItems) {
			return of(false);
		} else {
			return of(true);
		}
	}

	ngOnInit() {
		const queryParamsToRemove = ['bypassIntroGuards']; // Specify the query parameters to remove
		const currentQueryParams = { ...this.router.parseUrl(this.router.url).queryParams }; // Get the current query parameters
		queryParamsToRemove.forEach((param) => delete currentQueryParams[param]); // Remove the specified query parameters
		const navigationExtras: NavigationExtras = {
			queryParams: currentQueryParams,
		};

		this.router.navigate([], navigationExtras);

		this.isKioskMode = this.kioskModeService.isKisokMode();
		this.toggleLeft = this.sideNavService.toggleLeft;
		this.toggleRight = this.sideNavService.toggleRight;

		this.toggleLeft.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			if (res) {
				document.documentElement.style.position = 'fixed';
			} else {
				document.documentElement.style.position = 'static';
			}
		});

		this.userService.user$
			.pipe(
				filter(Boolean),
				map((user) => User.fromJSON(user)),
				filter((user) => !user.isTeacher() && user.isAdmin()),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				window.waitForAppLoaded();
				this.goHome(user);
			});

		this.inboxHasItems = combineLatest(
			this.liveDataService.requestsTotalNumber$,
			this.liveDataService.requestsLoaded$,
			this.liveDataService.invitationsTotalNumber$,
			this.liveDataService.invitationsLoaded$,
			(length1, loaded1, length2, loaded2) => {
				if (loaded1 && loaded2) {
					return length1 + length2 > 0;
				}
			}
		);

		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.isKioskMode = this.kioskModeService.isKisokMode();
				this.navbarHeight = this.currentNavbarHeight();
			}
		});
	}

	ngAfterViewInit(): void {
		window.appLoaded();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	shouldShowRouter() {
		// return this.userService.userData.pipe(map(u => u.isStudent() || u.isTeacher() || u.isAssistant()));
	}

	goHome(user) {
		const studentRedirectFromAdmin = this.storage.getItem('admin_not_teacher_student_redirect');
		if (studentRedirectFromAdmin) {
			const urlCommands = ['main', 'student', studentRedirectFromAdmin];
			this.router.navigate(urlCommands);
			this.storage.removeItem('admin_not_teacher_student_redirect');
			return;
		}

		const availableAccessTo = user.roles.filter((_role) => _role.match('admin_'));
		let tab;
		if (availableAccessTo.includes('admin_dashboard')) {
			tab = 'dashboard';
		} else if (availableAccessTo.includes('admin_hallmonitor')) {
			tab = 'hallmonitor';
		} else if (availableAccessTo.includes('admin_search')) {
			tab = 'search';
		} else if (availableAccessTo.includes('admin_pass_config')) {
			tab = 'passconfig';
		} else if (availableAccessTo.includes('admin_accounts')) {
			tab = 'accounts';
		}
		this.router.navigate(['/admin', tab]);
		return;
	}

	onSettingClick($event) {
		if (this.screenService.isDeviceLargeExtra) {
			this.data = $event;
			this.sideNavService.toggle$.next(true);
		}
	}

	fadeClick() {
		this.sideNavService.toggleLeft$.next(false);
		this.sideNavService.toggleRight$.next(false);

		this.sideNavService.sideNavAction$.next('');
		this.sideNavService.fadeClick$.next(true);
	}
}
