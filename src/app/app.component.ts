import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter as _filter } from 'lodash';
import { BehaviorSubject, combineLatest, fromEvent, merge, Observable, of, ReplaySubject, Subject, throwError, zip } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './ngrx/app-state/app-state';
import { NuxReferralComponent } from './nux-components/nux-referral/nux-referral.component';

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
import { DarkThemeSwitch } from './dark-theme-switch';

import { DeviceDetection } from './device-detection.helper';
import { School } from './models/School';
import { LoginService } from './services/login.service';
import { HttpService } from './services/http-service';
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
import { Util } from '../Util';
import { HelpCenterService } from './services/help-center.service';
import { CallDialogComponent } from './shared/shared-components/call-dialog/call-dialog.component';
import { FeatureFlagService, FLAGS } from './services/feature-flag.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';
import { ParentAccountService } from './services/parent-account.service';
import { HttpErrorResponse } from '@angular/common/http';

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

	helpCentreURL: SafeResourceUrl;

	private dialogContainer: HTMLElement;
	@ViewChild('dialogContainer', { static: true }) set content(content: ElementRef) {
		this.dialogContainer = content.nativeElement;
	}

	@ViewChild('trialBar') trialBarElementView: ElementRef;
	@ViewChild('helpIframe') helpCenterIframe: ElementRef;
	@ViewChild('helpCenterDiv') helpCenterDiv: ElementRef;

	public isAuthenticated = null;
	public isStudent = true;
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

	isAdmin$ = this.userService.userData.pipe(
		filter((u) => !!u),
		map((u) => u.isAdmin())
	);

	@HostListener('window:popstate', ['$event'])
	back() {
		if (DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile()) {
			window.history.pushState({}, '');
		}
	}

	@HostListener('document:scroll', ['$event'])
	scroll(event) {
		// adjust the height of the help center wrapping div if window is scrolled.
		if (this.helpCenterDiv && this.helpCenterDiv.nativeElement.offsetHeight < document.scrollingElement.getClientRects()[0].height) {
			this.renderer.setStyle(
				this.helpCenterDiv.nativeElement,
				'height',
				`${this.helpCenterDiv.nativeElement.offsetHeight + event.target.scrollingElement.scrollTop}px`
			);
		}
	}

	constructor(
		public darkTheme: DarkThemeSwitch,
		public loginService: LoginService,
		private userService: UserService,
		private nextReleaseService: NextReleaseService,
		private http: HttpService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private overlayContainer: OverlayContainer,
		private storageService: StorageService,
		private notifService: NotificationService,
		private shortcutsService: KeyboardShortcutsService,
		private screen: ScreenService,
		private toastService: ToastService,
		public helpCenter: HelpCenterService,
		private sanitizer: DomSanitizer,
		public featureFlags: FeatureFlagService,
		private cookie: CookieService,
		private titleService: Title,
		private renderer: Renderer2,
		private parentService: ParentAccountService,
		private store: Store<AppState>
	) {}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	ngOnInit() {
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

		this.helpCenter.open$.subscribe((open) => {
			if (open) {
				this.openHelpCenter(open);
			}
		});

		this.userService.loadedUser$
			.pipe(
				filter((l) => l),
				switchMap(() => this.userService.user$.pipe(take(1))),
				filter((user) => !!user),
				map((user) => User.fromJSON(user)),
				// Wait for schools to load so that we can register intercom and refiner correctly.
				mergeMap((user) => this.http.schools$.pipe(map(() => user))),
				concatMap((user) => {
					return this.intercomLauncherAdded$.pipe(map((intercomWrapper) => [user, intercomWrapper]));
				}),
				switchMap(([user, intercomWrapper]: [User, HTMLDivElement]) => {
					this.currentRoute = window.location.pathname;
					this.isStudent = user.isStudent();
					const urlBlackList = ['/forms', '/kioskMode'];
					const isAllowed = urlBlackList.every((route) => !this.currentRoute.includes(route));
					if (!user.isStudent() && !this.currentRoute.includes('/forms')) {
						this.registerRefiner(user);
					}

					if (intercomWrapper) {
						intercomWrapper.style.display = 'none';
					}

					if (isAllowed && !this.isMobile) {
						this.userService.registerThirdPartyPlugins(user);
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

		this.store
			.select((state: AppState) => state.user.user)
			.pipe(
				filter((user) => user !== null),
				take(1)
			)
			.subscribe((user) => {
				console.log('User object available:', user);
				this.openNuxReferralModal();
			});

		combineLatest([this.loginService.checkIfAuthStored(), this.loginService.isAuthenticated$.asObservable()])
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
				mergeMap(() => {
					/**
					 * We need to determine if the user is a parent or not.
					 * Since the login data is tied to an account, and we're already authenticated at this point, we can send
					 * a parent info request. If the request returns a 403 error, that means the account is not a parent
					 * account, and we can move forward to getting the schools and then the user data.
					 * If the request completes successfully, that means the account is a parent and there's no need to get
					 * schools data since schools are not tied to a parent account.
					 *
					 * We use a different endpoint instead of the regular v1/users/@me endpoint since those users are tied to
					 * schools and parents aren't.
					 *
					 * We should make raw requests here instead of the NgRx since the store hasn't been populated yet
					 */
					return this.parentService.getParentInfo().pipe(
						catchError((err) => {
							if (err instanceof HttpErrorResponse && err.status === 403) {
								// logged-in user is not a parent
								return of(null);
							}

							return throwError(err);
						}),
						concatMap((parentAccount) => {
							if (!parentAccount) {
								this.userService.getUserRequest();
								return this.http.schools$.pipe(
									concatMap(() => {
										return this.userService.userData.pipe(
											takeUntil(this.subscriber$),
											filter<User>(Boolean),
											map((u) => User.fromJSON(u))
										);
									})
								);
							}

							return of(User.fromJSON(parentAccount));
						})
					);
				}),
				tap((user) => {
					this.userService.getIntrosRequest();
					this.showUISubject.next(true);
					this.isAuthenticated = true;

					user = User.fromJSON(user);
					if (NotificationService.hasPermission && environment.production) {
						this.notifService.initNotifications(true);
					}
					const callbackUrl: string = window.history.state?.callbackUrl;
					if (callbackUrl != null || callbackUrl !== undefined) {
						this.router.navigate([callbackUrl]);
					} else if (this.isMobile && user.isAdmin() && user.isTeacher()) {
						this.router.navigate(['main']);
					} else if (user.isParent()) {
						this.router.navigate(['parent']);
					} else {
						const href = window.location.href;
						if (href.includes('/admin') || href.includes('/main')) {
							return;
						}

						const loadView = user.isAdmin() ? ['admin'] : ['main', 'passes'];
						this.router.navigate(loadView).then();
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
				this.hideSchoolToggleBar = data.hideSchoolToggleBar;
				this.hideScroll = data.hideScroll;
			});
	}

	registerRefiner(user: User) {
		_refiner('setProject', 'e832a600-7fe2-11ec-9b7a-cd5d0014e33d');
		const data = {
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
		};
		_refiner('identifyUser', data);
		console.log('refiner registered');
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

	openNuxReferralModal(): void {
		const subscription = this.store
			.select((state: AppState) => ({
				user: state.user.user,
				schoolEntities: state.schools.entities,
			}))
			.pipe(
				take(1),
				filter(({ user }) => user !== null),
				map(({ user, schoolEntities }) => {
					const userInstance = User.fromJSON(user);
					const userSchool = schoolEntities[user.school_id];
					const hasSeenModal = sessionStorage.getItem('hasSeenReferralModal');

					console.log(userInstance.isStaff());

					if (
						hasSeenModal === null &&
						user.referral_status === 'not_applied' &&
						!userSchool.feature_flag_referral_program &&
						userInstance.isStaff()
					) {
						const dialogRef = this.dialog.open(NuxReferralComponent, {
							data: {
								roles: user.roles,
							},
							panelClass: 'referral-dialog-container',
						});

						sessionStorage.setItem('hasSeenReferralModal', 'true');
					}
				})
			)
			.subscribe(
				() => {},
				(error) => {
					console.error('openNuxReferralModal subscription error:', error);
				}
			);
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

	openHelpCenter(event) {
		this.isUserHasPhoneAccess = this.featureFlags.isFeatureEnabled(FLAGS.PhoneAccess);
		this.helpCentreURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.smartpass.app/help-center');
		this.helpCenter.isHelpCenterOpen.next(event);
		setTimeout(() => {
			const BORDER_SIZE = 8;
			const panel = document.querySelector<HTMLElement>('#help-center-content');
			const fixedWrapper = document.querySelector<HTMLElement>('#fixed-wrapper');

			const dragDivider = document.querySelector<HTMLElement>('.drag-divider');

			if (this.helpCenterDiv && this.helpCenterDiv.nativeElement.offsetHeight < document.scrollingElement.getClientRects()[0].height) {
				console.log('render');
				this.renderer.setStyle(
					this.helpCenterDiv.nativeElement,
					'height',
					`${this.helpCenterDiv.nativeElement.offsetHeight + document.scrollingElement.scrollTop}px`
				);
			}
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
				fixedWrapper.style.width = parseInt(getComputedStyle(panel, '').width) + -1 + 'px';
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
}
