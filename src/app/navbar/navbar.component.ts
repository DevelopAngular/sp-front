import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	NgZone,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	Renderer2,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map, pluck, switchMap, takeUntil } from 'rxjs/operators';

import { DataService } from '../services/data-service';
import { LoginService } from '../services/login.service';
import { NavbarDataService } from '../main/navbar-data.service';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { SettingsComponent } from '../settings/settings.component';
import { FavoriteFormComponent } from '../favorite-form/favorite-form.component';
import { NotificationFormComponent } from '../notification-form/notification-form.component';
import { LocationsService } from '../services/locations.service';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { NotificationService } from '../services/notification-service';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { HttpService } from '../services/http-service';
import { IntroDialogComponent } from '../intro-dialog/intro-dialog.component';
import { ScreenService } from '../services/screen.service';
import { NavbarAnimations } from './navbar.animations';
import { StorageService } from '../services/storage.service';
import { KioskModeService } from '../services/kiosk-mode.service';
import { SideNavService } from '../services/side-nav.service';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import { DeviceDetection } from '../device-detection.helper';
import { TeacherPinComponent } from '../teacher-pin/teacher-pin.component';
import { NavbarElementsRefsService } from '../services/navbar-elements-refs.service';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { filter as _filter } from 'lodash';
import { SpAppearanceComponent } from '../sp-appearance/sp-appearance.component';
import { MyProfileDialogComponent } from '../my-profile-dialog/my-profile-dialog.component';
import { SpLanguageComponent } from '../sp-language/sp-language.component';
import * as moment from 'moment';
import { QRBarcodeGeneratorService } from '../services/qrbarcode-generator.service';
import { IdcardOverlayContainerComponent } from '../idcard-overlay-container/idcard-overlay-container.component';
import { IDCard, IDCardService } from '../services/IDCardService';
import { CheckForUpdateService } from '../services/check-for-update.service';
import { SmartpassSearchComponent } from '../smartpass-search/smartpass-search.component';
import { StreaksDialogComponent } from '../streaks-dialog/streaks-dialog.component';
import { FeatureFlagService, FLAGS } from '../services/feature-flag.service';
import { HelpCenterService } from '../services/help-center.service';

declare const window;

export interface RepresentedUser {
	user: User;
	roles: string[];
}

const minStreakCount = 2;

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
	animations: [NavbarAnimations.inboxAppearance, NavbarAnimations.arrowAppearance],
})
export class NavbarComponent implements AfterViewInit, OnInit, OnDestroy {
	@Input() hasNav = true;
	@Input() isParent: boolean = false;
	@ViewChild('tabPointer') tabPointer: ElementRef;
	@ViewChild('navButtonsContainer') navButtonsContainer: ElementRef;
	@ViewChildren('tabRef') tabRefs: QueryList<ElementRef>;
	@ViewChild('navbar') navbar: ElementRef;
	@ViewChild('setButton') settingsButton: ElementRef;

	@ViewChild('navButtonsContainerMobile') navButtonsContainerMobile: ElementRef;
	@ViewChild('smartpassSearch') set spSearch(comp: SmartpassSearchComponent) {
		if (!comp) {
			return;
		}
		if (!this.user.isTeacher()) {
			const spSearchContainer = document.querySelector<HTMLDivElement>('app-smartpass-search div.input-container');
			if (spSearchContainer) {
				spSearchContainer.style.display = 'none';
			}
		}
	}
	@ViewChildren('tabRefMobile') tabRefsMobile: QueryList<ElementRef>;

	@Output() settingsClick: EventEmitter<any> = new EventEmitter<any>();

	private destroyer$ = new Subject<any>();

	isStaff: boolean;
	showSwitchButton: boolean = false;
	user: User;
	representedUsers: RepresentedUser[];
	effectiveUser: RepresentedUser;
	tab = 'passes';
	inboxVisibility: boolean = JSON.parse(this.storage.getItem('showInbox'));
	introsData: any;
	kioskModeLocation: any;

	isOpenSettings: boolean;

	isStreaksOpen: boolean = false;
	@ViewChild('streaksButton') streaksButton: ElementRef;

	hideButtons: boolean;

	islargeDeviceWidth: boolean;

	isHallMonitorRoute: boolean;

	isMyRoomRoute: boolean;

	countSchools$: Observable<number>;
	isEnabledProfilePictures$: Observable<boolean>;

	buttonHash = {
		passes: {
			title: 'Home',
			route: 'passes',
			imgUrl: 'School',
			requiredRoles: ['_profile_teacher', 'access_passes'],
			hidden: false,
		},
		hallMonitor: {
			title: 'Hall Monitor',
			route: 'hallmonitor',
			imgUrl: 'New Hall Monitor',
			requiredRoles: ['_profile_teacher', 'access_hall_monitor'],
			hidden: false,
		},
		myRoom: {
			title: 'My Room',
			route: 'myroom',
			imgUrl: 'Room',
			requiredRoles: ['_profile_teacher', 'access_teacher_room'],
			hidden: false,
		},
	};

	buttons = Object.values(this.buttonHash);

	fakeMenu: ReplaySubject<boolean> = new ReplaySubject<boolean>();

	isInboxClicked: boolean;

	fadeClick: boolean;

	private pts;

	isAdminRoute: boolean;

	isAssistant: boolean;

	IDCardEnabled: boolean = false;

	IDCARDDETAILS: any;

	isUpdateBar$: ReplaySubject<{ active: boolean; color: any }>;

	@HostListener('window:resize')
	checkDeviceWidth() {
		this.islargeDeviceWidth = this.screenService.isDeviceLargeExtra;

		if (this.islargeDeviceWidth) {
			this.inboxVisibility = false;
		}

		if (this.screenService.isDesktopWidth) {
			this.inboxVisibility = true;
			this.navbarData.inboxClick$.next(false);
			this.isInboxClicked = false;
		}
		this.dataService.updateInbox(this.inboxVisibility);
	}

	constructor(
		private dataService: DataService,
		public userService: UserService,
		public dialog: MatDialog,
		public router: Router,
		private location: Location,
		public loginService: LoginService,
		private locationService: LocationsService,
		private _zone: NgZone,
		private navbarData: NavbarDataService,
		private activeRoute: ActivatedRoute,
		public notifService: NotificationService,
		public darkTheme: DarkThemeSwitch,
		private http: HttpService,
		private storage: StorageService,
		public kioskMode: KioskModeService,
		public screenService: ScreenService,
		public sideNavService: SideNavService,
		private cdr: ChangeDetectorRef,
		private rendered: Renderer2,
		private navbarElementsService: NavbarElementsRefsService,
		private shortcutsService: KeyboardShortcutsService,
		private qrBarcodeGenerator: QRBarcodeGeneratorService,
		private idCardService: IDCardService,
		private updateService: CheckForUpdateService,
		private featureService: FeatureFlagService,
		private helpCenter: HelpCenterService
	) {}

	get optionsOpen() {
		return this.tab === 'settings';
	}

	get isMobile() {
		return DeviceDetection.isMobile() || (this.screenService.windowWidth < 1170 && this.helpCenter.isHelpCenterOpen.getValue());
	}

	get showNav() {
		return this.tab !== 'intro' && this.hasNav;
	}

	get isIOSTablet() {
		return DeviceDetection.isIOSTablet();
	}

	get isKioskMode() {
		return !!this.kioskMode.getCurrentRoom().value;
	}

	get isSafari() {
		return DeviceDetection.isSafari();
	}

	get flexDirection() {
		let direction = 'row';
		if (this.screenService.isDeviceLargeExtra) direction = 'row-reverse';
		if (this.isKioskMode && this.screenService.isDeviceLargeExtra) direction = 'row';
		return direction;
	}

	get notificationBadge$() {
		return this.navbarData.notificationBadge$;
	}

	get showNotificationBadge() {
		return this.user && moment(this.user.created).add(7, 'days').isSameOrBefore(moment());
	}

	get streaksCount(): number {
		return this.user?.streak_count;
	}

	get isStreaks(): boolean {
		return this.featureService.isFeatureEnabled(FLAGS.ShowStreaks);
	}
	get mediaClass(): string {
		let rightClass = '';
		if (this.helpCenter.isHelpCenterOpen.getValue()) {
			if (this.screenService.windowWidth < 320) {
				rightClass = 'mediaWidth320';
			} else if (this.screenService.windowWidth < 475) {
				rightClass = 'mediaWidth475';
			} else if (this.screenService.windowWidth < 700) {
				rightClass = 'mediaWidth700';
			} else if (this.screenService.windowWidth < 940) {
				rightClass = 'mediaWidth940';
			}
		}
		return rightClass;
	}

	showStreakIcon(): boolean {
		return this.user.isStudent() && this.isStreaks && this.streaksCount > minStreakCount;
	}

	ngOnInit() {
		this.isUpdateBar$ = this.updateService.needToUpdate$;
		this.isEnabledProfilePictures$ = this.userService.isEnableProfilePictures$;
		this.shortcutsService.onPressKeyEvent$
			.pipe(
				filter(() => !this.isMobile),
				pluck('key'),
				takeUntil(this.destroyer$)
			)
			.subscribe((key) => {
				if (key[0] === ',') {
					const settingButton = this.settingsButton.nativeElement.querySelector('.icon-button-container');
					(settingButton as HTMLElement).click();
				} else if (
					((key[0] === '1' || key[0] === '2' || key[0] === '3') && !this.dialog.openDialogs) ||
					(!this.dialog.openDialogs.length && key[0] !== 'r')
				) {
					const route = {
						'1': 'passes',
						'2': 'hallmonitor',
						'3': 'myroom',
					};
					const currentButton = this.buttons.find((button) => button.route === route[key[0]]);
					if (this.buttonVisibility(currentButton)) {
						this.updateTab(currentButton.route);
					}
				}
			});
		this.hideButtons = this.router.url.includes('kioskMode') || this.router.url.includes('parent');
		const urlSplit: string[] = location.pathname.split('/');
		this.tab = urlSplit[urlSplit.length - 1];

		this.isHallMonitorRoute = this.router.url === '/main/hallmonitor';
		this.isMyRoomRoute = this.router.url === '/main/myroom';
		this.isAdminRoute = this.router.url.includes('/admin');
		this.router.events.subscribe((value) => {
			if (value instanceof NavigationEnd) {
				this.hideButtons = this.router.url.includes('kioskMode') || this.router.url.includes('parent');
				// this.hideButtons = this.router.url.includes("parent");
				let urlSplit: string[] = value.url.split('/');
				this.tab = urlSplit[urlSplit.length - 1];
				this.tab = this.tab === '' || this.tab === 'main' ? 'passes' : this.tab;
				this.inboxVisibility = this.tab !== 'settings';
				this.dataService.updateInbox(this.inboxVisibility);
				this.isHallMonitorRoute = value.url === '/main/hallmonitor';
				this.isMyRoomRoute = value.url === '/main/myroom';
				this.isAdminRoute = value.url.includes('/admin');
			}
		});

		this.navbarData.inboxClick$.subscribe((res) => {
			this.isInboxClicked = res;
		});

		this.kioskMode
			.getCurrentRoom()
			.pipe(takeUntil(this.destroyer$))
			.subscribe((location) => (this.kioskModeLocation = location));

		this.http.globalReload$
			.pipe(
				switchMap(() => {
					return combineLatest([this.userService.effectiveUser, this.userService.user$.pipe(filter((u) => !!u))]);
				}),
				takeUntil(this.destroyer$),
				switchMap(([eu, user]: [RepresentedUser, User]) => {
					this.user = User.fromJSON(user);
					if (this.isStreaks && !!this.user?.lost_streak_count && this.user.lost_streak_count > minStreakCount) {
						setTimeout(() => {
							this.openStreaks(this.streaksButton, true);
						}, 2000);
					}
					this.isStaff = this.user.isTeacher();
					this.isAssistant = this.user.isAssistant();
					if (this.userService.getFeatureFlagDigitalID() && !this.kioskMode.isKisokMode()) {
						this.idCardService.getIDCardDetails().subscribe({
							next: (result: any) => {
								if (result?.results?.digital_id_card) {
									if (result.results.digital_id_card.enabled) {
										this.IDCardEnabled = true;
									} else {
										return;
									}
									this.IDCARDDETAILS = result.results.digital_id_card;
									switch (this.IDCARDDETAILS.visible_to_who) {
										case 'Staff only':
											this.user.isTeacher() || this.user.isAdmin() ? (this.IDCardEnabled = true) : (this.IDCardEnabled = false);
											break;
										case 'Students only':
											this.user.isStudent() ? (this.IDCardEnabled = true) : (this.IDCardEnabled = false);
											break;
										case 'Students and Staff':
											this.IDCardEnabled = true;
											break;
										default:
											break;
									}
								}
							},
						});
					}
					this.showSwitchButton = [this.user.isAdmin(), this.user.isTeacher(), this.user.isStudent()].filter((val) => !!val).length > 1;
					if (eu) {
						this.effectiveUser = eu;
						this.buttons.forEach((button) => {
							if ((this.activeRoute.snapshot as any)._routerState.url === `/main/${button.route}` && !this.hasRoles(button.requiredRoles)) {
								this.fakeMenu.next(true);
							}
						});
						return this.dataService.getLocationsWithTeacher(eu.user);
					} else {
						return this.dataService.getLocationsWithTeacher(user);
					}
				})
			)
			.subscribe((locs): void => {
				if (!locs || (locs && !locs.length)) {
					this.buttonHash.myRoom.hidden = true;
				} else {
					this.buttonHash.myRoom.hidden = false;
				}
			});

		this.userService.representedUsers.pipe(takeUntil(this.destroyer$)).subscribe((res) => {
			this.representedUsers = res;
		});

		this.sideNavService.sideNavAction.pipe(takeUntil(this.destroyer$)).subscribe((action) => {
			this.settingsAction(action);
		});

		this.sideNavService.openSettingsEvent$
			.pipe(
				filter((r) => !!r),
				takeUntil(this.destroyer$)
			)
			.subscribe((res) => this.showOptions(this.settingsButton));

		this.islargeDeviceWidth = this.screenService.isDeviceLargeExtra;

		this.sideNavService.fadeClick.pipe(takeUntil(this.destroyer$)).subscribe((click) => (this.fadeClick = click));

		this.countSchools$ = this.http.schoolsCollection$.pipe(
			takeUntil(this.destroyer$),
			map((schools) => {
				const filteredSchools = _filter(schools, (school) => school.my_roles.length > 0);
				return filteredSchools.length;
			})
		);

		this.userService.introsData$
			.pipe(
				filter((res) => !!res),
				takeUntil(this.destroyer$)
			)
			.subscribe((data) => {
				this.introsData = data;
			});
	}

	ngAfterViewInit(): void {
		this.navbarElementsService.navbarRef$.next(this.navbar);
	}

	poofAnimation() {
		const poof_target = document.querySelector<HTMLElement>('#puff');
		function animatePoof() {
			var bgTop = 0,
				frame = 0,
				frames = 6,
				frameSize = 32,
				frameRate = 200,
				puff = poof_target;
			var animate = function () {
				if (frame < frames) {
					puff.style.backgroundPosition = '0 ' + bgTop + 'px';
					bgTop = bgTop - frameSize;
					frame++;
					setTimeout(animate, frameRate);
				} else {
					poof_target.style.display = 'none';
				}
			};
			animate();
		}
		poof_target.style.left = this.streaksButton.nativeElement.getBoundingClientRect().left + 20 + 'px';
		poof_target.style.top = this.streaksButton.nativeElement.getBoundingClientRect().top + 'px';
		poof_target.style.display = 'block';
		animatePoof();
	}

	getIcon(iconName: string, darkFill?: string, lightFill?: string) {
		return this.darkTheme.getIcon({
			iconName: iconName,
			darkFill: darkFill,
			lightFill: lightFill,
		});
	}

	getColor(setting?, hover?: boolean, hoveredColor?: string) {
		return this.darkTheme.getColor({
			setting: setting,
			hover: hover,
			hoveredColor: hoveredColor,
		});
	}

	hasRoles(roles: string[]) {
		let access;
		roles.forEach((role) => {
			access = this.user.roles.includes(role);
		});
		return access;
	}

	buttonVisibility(button) {
		return !!button && this.hasRoles(button.requiredRoles) && !button.hidden;
	}

	showOptions(event) {
		if (!this.isOpenSettings) {
			if (this.screenService.isDeviceLargeExtra) {
				this.sideNavService.toggle$.next(true);
				this.sideNavService.toggleLeft$.next(true);
			}

			const target = new ElementRef(event.currentTarget);
			if (!this.screenService.isDeviceLargeExtra) {
				this.isOpenSettings = true;
				UNANIMATED_CONTAINER.next(true);
				const settingRef = this.dialog.open(SettingsComponent, {
					panelClass: ['calendar-dialog-container', 'animation'],
					backdropClass: 'invis-backdrop',
					data: { trigger: target, isSwitch: this.showSwitchButton },
				});

				settingRef.afterClosed().subscribe((action) => {
					UNANIMATED_CONTAINER.next(false);
					this.isOpenSettings = false;
					this.settingsAction(action);
				});
			}

			this.settingsClick.emit({
				trigger: target,
				isSwitch: this.showSwitchButton,
			});

			this.sideNavService.sideNavData$.next({
				trigger: target,
				isSwitch: this.showSwitchButton,
			});

			this.sideNavService.sideNavType$.next('left');
		}
	}

	showTeaches(target) {
		const representedUsersDialog = this.dialog.open(DropdownComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: target.currentTarget,
				heading: 'You can create and manage passes for this teacher.',
				teachers: this.representedUsers.length > 1 ? this.representedUsers.map((u) => u.user) : null,
				selectedTeacher: this.effectiveUser.user,
				mainHeader: `Hi, ${this.user.display_name}`,
				maxHeight: '200px',
				isHiddenSearchField: this.representedUsers.length > 4,
			},
		});
		representedUsersDialog.afterClosed().subscribe((userOrId: User | string) => {
			if (userOrId instanceof User && userOrId.id == this.effectiveUser.user.id) {
				return;
			}

			const id = userOrId as string;
			const efUser = this.representedUsers.find((u) => +u.user.id === +id);
			this.userService.updateEffectiveUser(efUser);
			this.http.effectiveUserId.next(+efUser.user.id);
			this.userService.getUserPinRequest();
		});
	}

	settingsAction(action: string) {
		if (action === 'signout') {
			this.router.navigate(['sign-out']);
		} else if (action === 'myPin') {
			const teachPinDialog = this.dialog.open(TeacherPinComponent, {
				panelClass: 'sp-form-dialog',
				backdropClass: 'custom-backdrop',
			});
		} else if (action === 'profile') {
			this.dialog.open(MyProfileDialogComponent, {
				panelClass: 'sp-form-dialog',
				width: '425px',
				height: '500px',
			});
		} else if (action === 'language') {
			this.dialog.open(SpLanguageComponent, {
				panelClass: 'sp-form-dialog',
			});
		} else if (action === 'favorite') {
			const favRef = this.dialog.open(FavoriteFormComponent, {
				panelClass: 'form-dialog-container',
				backdropClass: 'custom-backdrop',
				data: { isStaff: this.isStaff },
			});

			favRef.afterClosed().subscribe((data) => {
				this.locationService.updateFavoriteLocationsRequest(data);
			});
		} else if (action === 'notifications') {
			if (!this.isSafari) {
				Notification.requestPermission();
			}

			let notifRef;
			if (NotificationService.hasSupport && NotificationService.canRequestPermission && !this.isSafari) {
				this.notifService.initNotifications(true).then((hasPerm) => {
					notifRef = this.dialog.open(NotificationFormComponent, {
						panelClass: 'form-dialog-container',
						backdropClass: 'custom-backdrop',
						width: '462px',
						height: '600px',
					});
				});
			} else {
				notifRef = this.dialog.open(NotificationFormComponent, {
					panelClass: 'form-dialog-container',
					backdropClass: 'custom-backdrop',
					width: '462px',
					height: '600px',
				});
			}
		} else if (action === 'intro') {
			this.dialog.open(IntroDialogComponent, {
				width: '100vw',
				height: '100vh',
				maxWidth: 'none',
				panelClass: 'intro-dialog-container',
				backdropClass: 'intro-backdrop-container',
				data: {
					entry: true,
				},
			});
		} else if (action === 'appearance') {
			this.dialog.open(SpAppearanceComponent, {
				panelClass: 'sp-form-dialog',
			});
		} else if (action === 'switch') {
			this.router.navigate(['admin']);
		} else if (action === 'team') {
			window.open('https://smartpass.app/team.html');
		} else if (action === 'support') {
			if (this.isStaff) {
				window.open('https://smartpass.app/support');
			} else {
				window.open('https://smartpass.app/studentdocs');
			}
		} else if (action === 'bug') {
			window.open('https://www.smartpass.app/bugreport');
		} else if (action === 'wishlist') {
			window.open('https://wishlist.smartpass.app');
		} else if (action === 'privacy') {
			window.open('https://www.smartpass.app/privacy?new=true');
		} else if (action === 'terms') {
			window.open('https://www.smartpass.app/terms');
		} else if (action === 'refer') {
			if (this.introsData?.referral_reminder.universal && !this.introsData?.referral_reminder.universal.seen_version) {
				this.userService.updateIntrosRequest(this.introsData, 'universal', '1');
			}
			window.open('https://www.smartpass.app/referrals');
		}
	}

	updateTab(route: string) {
		this.tab = route;
		// console.log('[updateTab()]: ', this.tab);
		this.router.navigateByUrl('/main/' + this.tab);
	}

	inboxClick() {
		this.inboxVisibility = !this.inboxVisibility;
		this.storage.setItem('showInbox', this.inboxVisibility);
		this.dataService.updateInbox(this.inboxVisibility);
		if (this.tab !== 'passes') {
			this.updateTab('passes');
		}

		this.navbarData.inboxClick$.next((this.isInboxClicked = !this.isInboxClicked));

		if (this.screenService.isDeviceLarge && !this.screenService.isDeviceMid) {
			this.sideNavService.toggleRight$.next(true);
		}
	}

	ngOnDestroy(): void {
		this.destroyer$.next();
		this.destroyer$.complete();
	}

	changeTabOpacity(clickedTab: HTMLElement, pressed: boolean) {
		if (DeviceDetection.isIOSMobile() || DeviceDetection.isIOSMobile()) {
			this.rendered.setStyle(clickedTab, 'opacity', 0.8);
			setTimeout(() => {
				this.rendered.setStyle(clickedTab, 'opacity', 1);
			}, 200);
		} else {
			this.rendered.setStyle(clickedTab, 'opacity', pressed ? 0.8 : 1);
		}
	}

	async openIDCard() {
		const idCardData: IDCard = {
			backgroundColor: this.IDCARDDETAILS.color,
			greadLevel: this.IDCARDDETAILS.show_grade_levels ? '10' : null,
			idNumberData: {
				idNumber: '21158',
				barcodeURL: await this.qrBarcodeGenerator.selectBarcodeType(this.IDCARDDETAILS.barcode_type, '123456'),
			},
			barcodeType: this.IDCARDDETAILS.barcode_type,
			backsideText: this.IDCARDDETAILS.backside_text,
			logoURL: this.IDCARDDETAILS.signed_url,
			profilePicture: '',
			schoolName: 'Demo School',
			userName: 'Demo User',
			userRole: 'Student',
			showCustomID: this.IDCARDDETAILS.show_custom_ids,
		};

		// idCardData.idNumberData.barcodeURL = await this.qrBarcodeGenerator.selectBarcodeType('code39', 123456);

		const dialogRef = this.dialog.open(IdcardOverlayContainerComponent, {
			panelClass: 'id-card-overlay-container',
			backdropClass: 'custom-bd',
			data: { idCardData: idCardData, isLoggedIn: true },
		});
	}

	isKioskModeSettingsPage() {
		if ((this.activeRoute.snapshot as any)._routerState.url === `/main/kioskMode/settings`) return true;
		return false;
	}

	openStreaks(event, isLost: boolean = false) {
		this.isStreaksOpen = true;
		let target;
		if (isLost) {
			target = event;
			setTimeout(() => {
				this.poofAnimation();
			}, 500);
		} else {
			target = new ElementRef(event.currentTarget);
		}
		const SDC = this.dialog.open(StreaksDialogComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: target,
				streaks_count: this.streaksCount,
				is_lost: isLost,
			},
		});

		SDC.afterClosed().subscribe((status) => {
			this.isStreaksOpen = false;
		});

		if (isLost) {
			this.userService.updateUserRequest(this.user, { lost_streak_count: null });
		}
	}
}
