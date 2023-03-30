import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter as _filter } from 'lodash';
import { BehaviorSubject, combineLatest, forkJoin, fromEvent, interval, merge, Observable, of, ReplaySubject, Subject, zip } from 'rxjs';

import {
	catchError,
	concatMap,
	distinctUntilChanged,
	filter,
	finalize,
	map,
	mergeMap,
	switchMap,
	take,
	takeUntil,
	tap,
	withLatestFrom,
} from 'rxjs/operators';
import { BUILD_INFO_REAL } from '../build-info';
import { DarkThemeSwitch } from './dark-theme-switch';

import { DeviceDetection } from './device-detection.helper';
import { School } from './models/School';
import { AdminService } from './services/admin.service';
import { LoginService } from './services/login.service';
import { HttpService } from './services/http-service';
import { KioskModeService } from './services/kiosk-mode.service';
import { StorageService } from './services/storage.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { APPLY_ANIMATED_CONTAINER, ConsentMenuOverlay } from './consent-menu-overlay';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { NotificationService } from './services/notification-service';
import { ShortcutInput } from 'ng-keyboard-shortcuts';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';
import { NextReleaseComponent, Update } from './next-release/next-release.component';
import { User } from './models/User';
import { UserService } from './services/user.service';
import { NextReleaseService } from './next-release/services/next-release.service';
import { ScreenService } from './services/screen.service';
import { ToastService } from './services/toast.service';
import _refiner from 'refiner-js';
import { CheckForUpdateService } from './services/check-for-update.service';
import { ColorProfile } from './models/ColorProfile';
import { Util } from '../Util';
import { HelpCenterService } from './services/help-center.service';
import { CallDialogComponent } from './shared/shared-components/call-dialog/call-dialog.component';
import { FeatureFlagService, FLAGS } from './services/feature-flag.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';

declare const window;
declare var ResizeObserver;

export const INITIAL_LOCATION_PATHNAME = new ReplaySubject<string>(1);

/**
 * @title Autocomplete overview
 */
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	shortcuts: ShortcutInput[];
	currentRoute: string;

	needToUpdateApp$: Subject<{ active: boolean; color: ColorProfile }>;
	helpCentreURL: SafeResourceUrl;

	private dialogContainer: HTMLElement;
	@ViewChild('dialogContainer', { static: true }) set content(content: ElementRef) {
		this.dialogContainer = content.nativeElement;
	}

	@ViewChild('trialBar') trialBarElementView: ElementRef;
	@ViewChild('helpIframe') helpCenterIframe: ElementRef;

	public isAuthenticated = null;
	public hideScroll = true;
	public hideSchoolToggleBar = false;
	public showUISubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public showUI: Observable<boolean> = this.showUISubject.asObservable();
	public schools: School[] = [];
	public darkThemeEnabled: boolean;
	public isKioskMode: boolean;
	public showSupportButton: boolean;
	public customToastOpen$: Observable<boolean>;
	public toasts$: Observable<any>;
	hasCustomBackdrop: boolean;
	customStyle: Record<string, any>;
	public hasCustomBackdrop$: Observable<boolean>;
	public customBackdropStyle$: Observable<any>;
	public user$: Observable<User>;
	intercomLauncherAdded$: BehaviorSubject<HTMLDivElement> = new BehaviorSubject<HTMLDivElement>(null);
	intercomObserver: MutationObserver;

	private subscriber$ = new Subject();

	public mainContentWidth: string = '100%';
	public rightPosition;

	public isUserHasPhoneAccess: boolean;

	// @ViewChild('help-centre-iframe') iframe: ElementRef;

	trialEndDate$ = this.http.currentSchoolSubject.pipe(
		takeUntil(this.subscriber$),
		filter((s) => !!s?.trial_end_date),
		map((s) => {
			const endDate = new Date(s.trial_end_date);
			// We want the trial to end at the end of the day specified by |trial_end_date|
			const day = 60 * 60 * 24 * 1000 - 1;
			const realEndDate = new Date(endDate.getTime() + day);
			return realEndDate;
		})
	);

	isAdmin$ = this.userService.userData.pipe(
		filter((u) => !!u),
		map((u) => u.isAdmin())
	);

	private todayDate = (() => {
		const date = new Date();
		return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
	})();

	@HostListener('window:popstate', ['$event'])
	back(event) {
		if (DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile()) {
			window.history.pushState({}, '');
		}
	}

	// @HostListener('window:mousemove', ['$event'])
	// onWindowBlur(event: any): void {
	// 	addEventListener('mousemove', function (e) {
	// 		console.log('On iframe');
	// 	});
	// }

	constructor(
		public darkTheme: DarkThemeSwitch,
		public loginService: LoginService,
		private userService: UserService,
		private nextReleaseService: NextReleaseService,
		private http: HttpService,
		private adminService: AdminService,
		private _zone: NgZone,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private overlayContainer: OverlayContainer,
		private storageService: StorageService,
		private kms: KioskModeService,
		private notifService: NotificationService,
		private shortcutsService: KeyboardShortcutsService,
		private screen: ScreenService,
		private toastService: ToastService,
		private updateService: CheckForUpdateService,
		public helpCenter: HelpCenterService,
		private sanitizer: DomSanitizer,
		public featureFlags: FeatureFlagService,
		private cookie: CookieService,
		private titleService: Title
	) {}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	ngOnInit() {
		this.updateService.check();
		this.customToastOpen$ = this.toastService.isOpen$;
		this.toasts$ = this.toastService.toasts$;
		this.user$ = this.userService.user$.pipe(map((user) => User.fromJSON(user)));
		this.screen.customBackdropEvent$.asObservable().subscribe({
			next: (hasBackdrop: boolean) => (this.hasCustomBackdrop = hasBackdrop),
		});
		this.screen.customBackdropStyle$.asObservable().subscribe({
			next: (customStyle: Record<string, any>) => (this.customStyle = customStyle),
		});

		this.hasCustomBackdrop$ = this.screen.customBackdropEvent$.asObservable();
		this.customBackdropStyle$ = this.screen.customBackdropStyle$;

		this.router.events.pipe(filter(() => DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile())).subscribe((event) => {
			if (event instanceof NavigationEnd) {
				window.history.pushState({}, '');
			}
		});

		this.needToUpdateApp$ = this.updateService.needToUpdate$;

		this.helpCenter.open$.subscribe((open) => {
			if (open) {
				this.openHelpCenter(open);
			}
		});

		// set only an already set up language is found
		// otherwise let the language component try to translate
		/*const savedLang = this.storageService.getItem('codelang');
    if (!!savedLang) {
      this.http.currentLang$.pipe(
        takeUntil(this.subscriber$),
        filter(res => !!res),
      ).subscribe(chosenLang => {
        try {
          this.localize.load_localize_scripts(() => {
            // Localizejs saves in localstorage an intem ljs-source-lang that stores the original lanuage
            // the original language may be taken from lang html attribute of page
            // or the official way below
            const sourceLanguage = this.localize.getSourceLanguage();
            this.localize.from(sourceLanguage).to(chosenLang);
          });
        } catch (err) {
          this.localize.disableLanguage();
        }
      });
    }*/

		this.userService.loadedUser$
			.pipe(
				filter((l) => l),
				switchMap((l) => this.userService.user$.pipe(take(1))),
				filter((user) => !!user),
				map((user) => User.fromJSON(user)),
				concatMap((user) => {
					return this.intercomLauncherAdded$.pipe(map((intercomWrapper) => [user, intercomWrapper]));
				}),
				switchMap(([user, intercomWrapper]: [User, HTMLDivElement]) => {
					this.currentRoute = window.location.pathname;
					const urlBlackList = [
						'/forms',
						'/kioskMode',
						// '/login'
					];
					const isAllowed = urlBlackList.every((route) => !this.currentRoute.includes(route));
					if (!user.isStudent() && !this.currentRoute.includes('/forms')) {
						this.registerRefiner(user);
					}

					if (intercomWrapper) {
						// intercomWrapper.style.display = user.isStudent() ? 'none' : 'block';
						intercomWrapper.style.display = 'none';
					}

					if (isAllowed && !this.isMobile) {
						this.registerThirdPartyPlugins(user);
					}
					return this.nextReleaseService.getLastReleasedUpdates(DeviceDetection.platform()).pipe(
						map((release: Array<Update>): Array<Update> => {
							return release.filter((update) => {
								const allowUpdate: boolean = !!update.groups.find((group) => {
									return user.roles.includes(`_profile_${group}`);
								});
								return allowUpdate;
							});
						})
					);
				}),
				filter((release: Array<Update>) => !!release.length),
				switchMap((release) => {
					let config;
					if (DeviceDetection.isMobile()) {
						config = {
							panelClass: 'main-form-dialog-container-mobile',
							width: '100%',
							maxWidth: '100%',
							height: '100%',
							data: {
								isStudent: false,
								isTeacher: true,
								releaseUpdates: release,
							},
						};
					} else {
						config = {
							panelClass: 'main-form-dialog-container',
							width: '425px',
							maxHeight: '450px',
							data: {
								isStudent: false,
								isTeacher: true,
								releaseUpdates: release,
							},
						};
					}
					const dialogRef = this.dialog.open(NextReleaseComponent, config);
					return dialogRef
						.afterClosed()
						.pipe(
							switchMap(() => zip(...release.map((update: Update) => this.nextReleaseService.dismissUpdate(update.id, DeviceDetection.platform()))))
						);
				})
			)
			.subscribe();

		this.shortcutsService.initialize();
		this.shortcuts = this.shortcutsService.shortcuts;

		// this.googleAnalytics.init();
		const fcm_sw = localStorage.getItem('fcm_sw_registered');
		if (fcm_sw === 'true') {
			this.notifService.initNotifications(true);
		}

		INITIAL_LOCATION_PATHNAME.next(window.location.pathname);

		this.darkTheme.isEnabled$.subscribe((val) => {
			this.darkThemeEnabled = val;
			document.documentElement.style.background = val ? '#0F171E' : '#FBFEFF';
			document.body.style.boxShadow = `0px 0px 100px 100px ${val ? '#0F171E' : '#FBFEFF'}`;
		});

		if (!DeviceDetection.isIOSTablet() && !DeviceDetection.isMacOS()) {
			const link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('href', './assets/css/custom_scrollbar.css');
			document.head.appendChild(link);
		}

		combineLatest([this.checkIfAuthOnLoad(), this.loginService.isAuthenticated$.asObservable()])
			.pipe(
				map(([authOnLoad, authStateChanged]) => authOnLoad || authStateChanged),
				distinctUntilChanged(),
				tap((isAuth) => {
					const path = window.location.pathname;
					if (!isAuth) {
						if (path.includes('main/student')) {
							this.storageService.setItem('initialUrl', path);
						}
						this.showUISubject.next(true);
						this.isAuthenticated = false;
					}
				}),
				filter(Boolean),
				tap(() => {
					this.http.getSchoolsRequest();
				}),
				mergeMap(() => {
					return this.http.schools$.pipe(filter(Boolean));
				}),
				tap(() => {
					this.showUISubject.next(true);
					this.userService.getUserRequest();
					this.userService.getIntrosRequest();
					this.isAuthenticated = true;
				}),
				mergeMap(() => this.userService.userData.pipe(takeUntil(this.subscriber$), filter<User>(Boolean))),
				tap((user) => {
					user = User.fromJSON(user);
					if (NotificationService.hasPermission && environment.production) {
						this.notifService.initNotifications(true);
					}

					const callbackUrl: string = window.history.state.callbackUrl;
					if (callbackUrl != null || callbackUrl !== undefined) {
						this.router.navigate([callbackUrl]);
					} else if (this.isMobile && user.isAdmin() && user.isTeacher()) {
						this.router.navigate(['main']);
					} else if (user.isParent()) {
						this.router.navigate(['parent']);
					} else {
						let showRenewalPage$ = of(false);
						if (user.isAdmin() && this.featureFlags.isFeatureEnabled(FLAGS.RenewalChecklist)) {
							showRenewalPage$ = this.isAdminUpForRenewal$();
						}

						showRenewalPage$.subscribe({
							next: (show) => {
								const href = window.location.href;
								if (href.includes('/admin') || href.includes('/main')) {
									return;
								}

								if (show) {
									this.router.navigate(['admin', 'renewal']).then();
									return;
								}

								const loadView = user.isAdmin() ? ['admin', 'dashboard'] : ['main', 'passes'];
								this.router.navigate(loadView).then();
							},
						});
					}
					this.titleService.setTitle('SmartPass');
				})
			)
			.subscribe();

		this.http.schoolsCollection$
			.pipe(
				map((schools) => _filter(schools, (school) => school.my_roles.length > 0)),
				withLatestFrom(this.http.currentSchool$),
				takeUntil(this.subscriber$)
			)
			.subscribe(([schools, currentSchool]) => {
				this.schools = schools;
				const isCurrentSchoolInList = schools.find((s) => s.id === currentSchool.id);
				if (currentSchool && !isCurrentSchoolInList) {
					this.http.setSchool(schools[0]);
				}
			});

		this.http.currentSchool$.pipe(takeUntil(this.subscriber$)).subscribe((value) => {
			if (!value) {
				this.schools = [];
			}
		});
		this.router.events
			.pipe(
				takeUntil(this.subscriber$),
				filter((event) => event instanceof NavigationEnd),
				map(() => this.activatedRoute),
				map((route) => {
					if (this.isMobile) {
						window.Intercom('update', { hide_default_launcher: true });
					}
					this.isKioskMode = this.router.url.includes('kioskMode');
					if (route.firstChild) {
						route = route.firstChild;
					}
					return route;
				}),
				mergeMap((route) => route.data)
			)
			.subscribe((data) => {
				const existingHub: any = document.querySelector('#hubspot-messages-iframe-container');
				let newHub: any;

				if (!existingHub) {
					newHub = document.createElement('script');
					newHub.type = 'text/javascript';
					newHub.id = 'hs-script-loader';
					newHub.setAttribute('id', 'hs-script-loader');
					newHub.src = '//js.hs-scripts.com/5943240.js';
				}

				if (data.currentUser) {
					this.hubSpotSettings(data.currentUser);
				}

				if (
					data.hubspot &&
					((data.currentUser && !data.currentUser.isStudent() && data.authFree) || !this.kms.getCurrentRoom().value) &&
					!this.screen.isDeviceLargeExtra
				) {
					if (!existingHub) {
						this.showSupportButton = true;
						document.body.appendChild(newHub);
						const dst = new Subject<any>();
						interval(100)
							.pipe(takeUntil(dst))
							.subscribe(() => {
								if (window._hsq) {
									dst.next();
									dst.complete();
								}
							});
					} else {
						(existingHub as HTMLElement).setAttribute('style', 'display: block !important;width: 100px;height: 100px');
					}
				} else {
					if (existingHub) {
						(existingHub as HTMLElement).setAttribute('style', 'display: none !important');
					}
				}

				this.hideSchoolToggleBar = data.hideSchoolToggleBar;
				this.hideScroll = data.hideScroll;
			});
	}

	isAdminUpForRenewal$(): Observable<boolean> {
		return forkJoin([this.adminService.getRenewalData(), this.userService.introsData$.pipe(take(1))]).pipe(
			take(1),
			map(([resp, intros]) => {
				const show = resp.renewal_status == 'expiring' || !intros.seen_renewal_page?.universal?.seen_version;
				return { intros, show };
			}),
			tap(({ intros, show }) => {
				if (show && !intros.seen_renewal_page?.universal?.seen_version) {
					this.userService.updateIntrosSeenRenewalStatusPageRequest(intros, 'universal', '1');
				}
			}),
			map(({ show }) => show),
			catchError(() => of(false))
		);
	}

	registerRefiner(user: User) {
		_refiner('setProject', 'e832a600-7fe2-11ec-9b7a-cd5d0014e33d');
		_refiner('identifyUser', {
			id: user.id,
			email: user.primary_email,
			created_at: user.created,
			last_login_at: user.last_login,
			last_active_at: user.last_active,
			first_login_at: user.first_login,
			first_name: user.first_name,
			last_name: user.last_name,
			type: user.isAdmin() ? 'admin' : 'teacher',
			status: user.status,
			sync_types: !user.sync_types.length ? 'password' : user.sync_types.length === 1 ? user.sync_types[0] : user.sync_types,
			name: user.display_name,
			account: {
				id: this.http.getSchool().id, // <- School Id
				name: this.http.getSchool().name,
			},
		});
		// _refiner('showForm', '31b6c030-820a-11ec-9c99-8b41a98d875d');
	}

	registerThirdPartyPlugins(user: User) {
		// const intercomLauncher = document.querySelector<HTMLDivElement>('div.intercom-lightweight-app');
		// if (user.isStudent() && intercomLauncher) {
		//   intercomLauncher.style.display = 'none';
		// } else {
		//   intercomLauncher.style.display = 'block';
		// }
		setTimeout(() => {
			console.log('registering third party plugins');
			const now = new Date();
			const school: School = this.http.getSchool();

			let trialEndDate: Date;
			if (!!school.trial_end_date) {
				const d = new Date(school.trial_end_date);
				// Drop the time so that the date is the same when we call .toDateString()
				trialEndDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
			}

			let accountType = user.sync_types[0] === 'google' ? 'Google' : user.sync_types[0] === 'clever' ? 'Clever' : 'Standard';
			let trialing = !!trialEndDate && trialEndDate > now ? true : false;
			let trialEndDateStr = !!trialEndDate ? trialEndDate.toDateString() : 'N/A';

			window.intercomSettings = {
				user_id: user.id,
				name: user.display_name,
				email: user.primary_email,
				created: new Date(user.created),
				type: this.getUserType(user),
				status: user.status,
				account_type: accountType,
				first_login_at: user.first_login,
				company: {
					id: school.id,
					name: school.name,
					'Id Card Access': school.feature_flag_digital_id,
					'Plus Access': school.feature_flag_encounter_detection,
					Trialing: trialing,
					'Trial End Date': trialEndDateStr,
				},
				hide_default_launcher: false,
				custom_launcher_selector: '.live-chat',
			};
			window.Intercom('update');

			window.posthog.identify(user.id, {
				name: user.display_name,
				email: user.primary_email,
				created: new Date(user.created),
				type: this.getUserType(user),
				status: user.status,
				account_type: accountType,
				first_login_at: user.first_login,
				school_id: school.id,
				school_name: school.name,
				id_card_access: school.feature_flag_digital_id,
				encounter_detection_access: school.feature_flag_encounter_detection,
				trialing: trialing,
				trial_end_date: trialEndDateStr,
			});
		}, 3000);
	}

	getDaysUntil(date: Date): number {
		const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		// @ts-ignore
		const diffDays = Math.round(Math.abs((date - this.todayDate) / oneDay));
		return diffDays;
	}

	getDayText(days: number): string {
		return days === 1 ? 'day' : 'days';
	}

	getUserType(user: User): string {
		if (user.isAdmin()) {
			return 'Admin';
		} else if (user.isTeacher()) {
			return 'Teacher';
		} else if (user.isAssistant()) {
			return 'Assistant';
		} else if (user.isStudent()) {
			return 'Student';
		}
		return 'unknown user';
	}

	hubSpotSettings(user) {
		const _hsq = (window._hsq = window._hsq || []);

		const myPush = function (a) {
			if (!BUILD_INFO_REAL) {
				// console.log('Pushed:', a);
			}
			_hsq.push(a);
		};

		myPush([
			'identify',
			{
				email: user.primary_email,
				firstname: user.first_name,
				lastname: user.last_name,
			},
		]);

		myPush(['setPath', '/admin/dashboard']);
		myPush(['trackPageView']);
	}

	getBarBg(color, hovered, pressed) {
		if (hovered) {
			if (pressed) {
				return Util.convertHex(color, 20);
			}
			return Util.convertHex(color, 15);
		}
		return Util.convertHex(color, 10);
	}

	ngOnDestroy() {
		this.subscriber$.next(null);
		this.subscriber$.complete();
	}

	ngAfterViewInit() {
		if (this.isMobile) {
			window.Intercom('update', { hide_default_launcher: true });
		}
		APPLY_ANIMATED_CONTAINER.subscribe((v: boolean) => {
			if (v) {
				const zIndexForContainer = (this.dialog.openDialogs.length + 1) * 1000;
				this.dialogContainer.classList.add('unanimated-dialog-container');
				this.dialogContainer.style.zIndex = `${zIndexForContainer}`;
				(this.overlayContainer as ConsentMenuOverlay).setContainer(this.dialogContainer);
			} else {
				this.dialogContainer.style.zIndex = '-1';
				this.dialogContainer.classList.remove('unanimated-dialog-container');
				(this.overlayContainer as ConsentMenuOverlay).restoreContainer();
			}
		});

		// listen for existence of Intercom wrapper
		// stop listening when the Intercom wrapper is found
		const targetNode = document.body;
		const listenerConfig = { childList: true, subtree: true };
		this.intercomObserver = new MutationObserver((mutationList, observer) => {
			for (const m of mutationList) {
				// @ts-ignore
				if ((m.target as HTMLElement).tagName !== 'BODY') {
					return;
				}
				m.addedNodes.forEach((node) => {
					if (node.nodeType === node.COMMENT_NODE) {
						return;
					}
					if ((node as HTMLElement).classList.contains('intercom-lightweight-app')) {
						this.intercomLauncherAdded$.next(node as HTMLDivElement);
						this.intercomObserver.disconnect();
					}
				});
			}
		});
		this.intercomObserver.observe(targetNode, listenerConfig);
	}

	get setHeight() {
		if (this.trialBarElementView?.nativeElement?.offsetHeight && document.getElementById('school_toggle_bar')) {
			return `calc(100% - ${this.trialBarElementView?.nativeElement?.offsetHeight}px - 51px)`;
		} else if (this.trialBarElementView?.nativeElement?.offsetHeight) {
			return `calc(100% - ${this.trialBarElementView?.nativeElement?.offsetHeight}px)`;
		} else {
			return '100%';
		}
	}

	updateApp() {
		this.updateService.update();
	}

	openHelpCenter(event) {
		this.isUserHasPhoneAccess = this.featureFlags.isFeatureEnabled(FLAGS.PhoneAccess);
		this.helpCentreURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.smartpass.app/help-center');
		this.helpCenter.isHelpCenterOpen.next(event);
		setTimeout(() => {
			const BORDER_SIZE = 8;
			const panel = document.querySelector<HTMLElement>('#help-center-content');

			const dragDivider = document.querySelector<HTMLElement>('.drag-divider');
			setTimeout(() => {
				const mainRouter = document.querySelector<HTMLElement>('.router-outlet');
				mainRouter.style.transition = 'none';
			}, 1000);
			panel.style.transition = 'none';
			let m_pos;
			function resize(e) {
				const dx = m_pos - e.x;
				m_pos = e.x;
				panel.style.width = parseInt(getComputedStyle(panel, '').width) + dx + 'px';
			}

			let iframe = document.querySelector<HTMLIFrameElement>('.help-center-unsubscribe');

			const mouseDown$ = fromEvent<MouseEvent>(panel, 'mousedown');
			const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove');
			const mouseUp$ = merge(
				fromEvent<MouseEvent>(dragDivider, 'mouseup'),
				fromEvent<MouseEvent>(iframe, 'mouseup'),
				fromEvent<MouseEvent>(panel, 'mouseup'),
				fromEvent<MouseEvent>(document, 'mouseup')
			);

			mouseDown$
				.pipe(
					switchMap((event) =>
						mouseMove$.pipe(
							tap((ev) => {
								if (event.offsetX < BORDER_SIZE) {
									resize(ev);
									iframe.style.display = 'block';
									document.body.style.cursor = 'col-resize';
									dragDivider.style.setProperty('--drag-after-color', '#00B476');
									dragDivider.style.setProperty('--drag-after-shadow', '1px');
									dragDivider.style.setProperty('--drag-after-left', '2px');
								}
							}),
							takeUntil(mouseUp$),
							finalize(() => {
								document.body.style.cursor = 'default';
								dragDivider.style.setProperty('--drag-after-color', '#B7C1CF');
								dragDivider.style.setProperty('--drag-after-shadow', '0px');
								dragDivider.style.setProperty('--drag-after-left', '0px');
								iframe.style.display = 'none';
							})
						)
					)
				)
				.subscribe();

			const myEl = document.querySelector('#help-center-content');

			// Create observer
			const observer = new ResizeObserver((element) => {
				if (!this.helpCenter.isHelpCenterOpen.getValue()) {
					this.mainContentWidth = '100%';
				} else if (document.getElementById('help-center-content')) {
					this.mainContentWidth = `calc(100% - ${document.getElementById('help-center-content').offsetWidth}px)`;
				}
			});

			// Add element (observe)
			observer.observe(myEl);
		}, 100);
	}

	closeHelpCenter() {
		this.helpCenter.isHelpCenterOpen.next(false);
		window.Intercom('update', { hide_default_launcher: true });
	}

	openCallDialog(event) {
		const target = new ElementRef(event.currentTarget);
		const CDC: MatDialogRef<CallDialogComponent> = this.dialog.open(CallDialogComponent, {
			panelClass: 'consent-dialog-container-helpcenter',
			backdropClass: 'invis-backdrop-helpcenter',
			data: {
				trigger: target,
			},
		});
		window.document.querySelector('.invis-backdrop-helpcenter').parentNode.style.zIndex = '1009';

		CDC.afterClosed().subscribe((status) => {
			window.document.querySelector('.cdk-overlay-container').style.zIndex = '1005';
		});
	}

	openLiveChat() {
		window.Intercom('update', { hide_default_launcher: true });
	}

	private checkIfAuthOnLoad(): Observable<boolean> {
		const isCookiePresent = !!this.cookie.get('smartpassToken');

		if (!isCookiePresent) {
			this.storageService.removeItem('server');
			return of(false);
		}

		const svrString = this.storageService.getItem('server');
		if (!svrString) {
			return of(false);
		}

		return of(true);
	}
}
