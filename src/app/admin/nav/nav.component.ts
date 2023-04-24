import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	NgZone,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataService } from '../../services/data-service';
import { User } from '../../models/User';
import { UserService } from '../../services/user.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SettingsComponent } from '../settings/settings.component';
import { filter, map, pluck, takeUntil, tap } from 'rxjs/operators';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { UNANIMATED_CONTAINER } from '../../consent-menu-overlay';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { SpAppearanceComponent } from '../../sp-appearance/sp-appearance.component';
import { SpLanguageComponent } from '../../sp-language/sp-language.component';
import { MyProfileDialogComponent } from '../../my-profile-dialog/my-profile-dialog.component';

import * as moment from 'moment';
import { DeviceDetection } from '../../device-detection.helper';
import { PagesDialogComponent } from '../explore/pages-dialog/pages-dialog.component';
import { View } from '../explore/explore.component';
import { StorageService } from '../../services/storage.service';
import { ComponentsService } from '../../services/components.service';
import { School } from '../../models/School';
import { NavbarElementsRefsService } from '../../services/navbar-elements-refs.service';
import { FeatureFlagService, FLAGS } from '../../services/feature-flag.service';

declare const window;

interface NavButtons {
	title: string;
	id: string;
	route: string;
	type: string;
	imgUrl: string;
	requiredRoles: string[];
	isExpand?: boolean;
	isPro?: boolean;
}

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('settingsButton', { static: true }) settingsButton: ElementRef;
	@ViewChild('navButtonsContainter', { static: true }) navButtonsContainterRef: ElementRef;
	@ViewChildren('tabRef') tabRefs: QueryList<ElementRef>;

	@Output('restrictAccess') restrictAccess: EventEmitter<boolean> = new EventEmitter();

	buttons: NavButtons[] = [
		{
			title: 'Dashboard',
			id: 'dashboard',
			route: 'dashboard',
			type: 'routerLink',
			imgUrl: 'Dashboard',
			requiredRoles: ['_profile_admin', 'access_admin_dashboard'],
		},
		{
			title: 'Hall Monitor',
			id: 'hallMonitor',
			route: 'hallmonitor',
			type: 'routerLink',
			imgUrl: 'Walking',
			requiredRoles: ['_profile_admin', 'admin_hall_monitor'],
		},
		{
			title: 'Explore',
			id: 'explore',
			route: 'explore',
			type: 'openMenu',
			imgUrl: 'Search Eye',
			requiredRoles: ['_profile_admin', 'access_admin_search'],
			isExpand: true,
		},
		{
			title: 'Rooms',
			id: 'rooms',
			route: 'passconfig',
			type: 'routerLink',
			imgUrl: 'Room',
			requiredRoles: ['_profile_admin', 'access_pass_config'],
		},
		{
			title: 'Accounts',
			id: 'accounts',
			route: 'accounts',
			type: 'routerLink',
			imgUrl: 'Users',
			requiredRoles: ['_profile_admin', 'access_user_config'],
		},
		{
			title: 'ID Cards',
			id: 'idCards',
			route: 'idcards',
			type: 'routerLink',
			imgUrl: 'Digital ID Cards',
			requiredRoles: ['_profile_admin', 'manage_school'],
			isPro: !this.userService.getFeatureFlagDigitalID(),
		},
	];

	views: View = {
		pass_search: { id: 1, title: 'Passes', color: '#00B476', icon: 'Pass Search', action: 'pass_search' },
		report_search: { id: 2, title: 'Report Submissions', color: '#E32C66', icon: 'Report Search', action: 'report_search' },
		contact_trace: { id: 3, title: 'Contact Trace', color: '#139BE6', icon: 'Contact Trace', action: 'contact_trace' },
		encounter_detection: {
			id: 4,
			title: 'Detected Encounters',
			color: '#1F195E',
			icon: 'Encounter Detection',
			action: 'encounter_detection',
			isPro: !this.userService.getFeatureEncounterDetection(),
		},
	};

	currentView$: BehaviorSubject<string> = new BehaviorSubject<string>(this.storage.getItem('explore_page') || 'pass_search');

	fakeMenu = new BehaviorSubject<boolean>(false);
	tab: string[] = ['dashboard'];
	currentTab: string;
	introsData: any;
	public pts: string;

	user: User;
	showButton: boolean;
	selectedSettings: boolean;
	process: number;
	hidePointer: boolean;

	destroy$: Subject<any> = new Subject<any>();

	currentSchool: School;

	constructor(
		public router: Router,
		public featureFlagService: FeatureFlagService,
		private activeRoute: ActivatedRoute,
		private dataService: DataService,
		private userService: UserService,
		private dialog: MatDialog,
		private _zone: NgZone,
		public darkTheme: DarkThemeSwitch,
		private shortcutsService: KeyboardShortcutsService,
		private storage: StorageService,
		private cdr: ChangeDetectorRef,
		private componentService: ComponentsService,
		private navbarService: NavbarElementsRefsService
	) {}

	get pointerTopSpace() {
		return this.pts;
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	get isRenewalChecklistEnabled() {
		return this.featureFlagService.isFeatureEnabled(FLAGS.RenewalChecklist);
	}

	get showNotificationBadge() {
		return this.user && moment(this.user.first_login).add(30, 'days').isSameOrBefore(moment());
	}

	ngAfterViewInit() {
		this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainterRef);
	}

	ngOnInit() {
		const url: string[] = this.router.url.split('/');
		this.currentTab = url[url.length - 1];
		this.tab = url.slice(1);
		let tabStr = JSON.stringify(this.tab);
		this.tab = tabStr === '' || tabStr === 'admin' ? ['dashboard'] : this.tab;
		this.router.events.pipe(takeUntil(this.destroy$)).subscribe((value) => {
			if (value instanceof NavigationEnd) {
				const urlSplit: string[] = value.url.split('/');
				this.currentTab = urlSplit[urlSplit.length - 1];
				this.tab = urlSplit.slice(1);
				tabStr = JSON.stringify(this.tab);
				this.tab = tabStr === '' || tabStr === 'admin' ? ['dashboard'] : this.tab;
				this.navbarService.setPointerVisible(!(this.process === 100 && this.tab.indexOf('gettingstarted') !== -1));
			}
		});

		this.userService.user$
			.pipe(
				filter((user) => !!user),
				takeUntil(this.destroy$)
			)
			.subscribe((user) => {
				this.buttons.forEach((button) => {
					if (
						(this.activeRoute.snapshot as any)._routerState.url === `/admin/${button.route}` &&
						!button.requiredRoles.every((_role) => user.roles.includes(_role))
					) {
						this.restrictAccess.emit(true);
						this.fakeMenu.next(true);
					} else {
						this.restrictAccess.emit(false);
						this.fakeMenu.next(false);
					}
				});

				this.user = user;
				this.showButton =
					user.roles.includes('_profile_admin') && (user.roles.includes('_profile_teacher') || user.roles.includes('_profile_student'));
				this.dataService.updateInbox(!this.tab.includes('settings'));
			});

		this.shortcutsService.onPressKeyEvent$
			.pipe(
				filter(() => !this.isMobile),
				takeUntil(this.destroy$),
				pluck('key')
			)
			.subscribe((key) => {
				if (key[0] === ',') {
					const settingButton = this.settingsButton.nativeElement.querySelector('.icon-button-container');
					(settingButton as HTMLElement).click();
				} else if (
					((key[0] === '1' || key[0] === '2' || key[0] === '3' || key[0] === '4' || key[0] === '5' || key[0] === '6') && !this.dialog.openDialogs) ||
					!this.dialog.openDialogs.length
				) {
					const route = {
						'1': 'dashboard',
						'2': 'hallmonitor',
						'3': 'explore',
						'4': 'passconfig',
						'5': 'accounts',
						'6': 'myschool',
					};
					const currentButton = this.buttons.find((button) => button.route === route[key[0]]);
					this.route(currentButton);
					if (!this.router.url.includes(currentButton.route)) {
						this.setCurrentUnderlinePos(this.tabRefs, this.navButtonsContainterRef);
					}
				}
			});

		this.userService.introsData$
			.pipe(
				filter((res) => !!res),
				takeUntil(this.destroy$)
			)
			.subscribe((data) => {
				this.introsData = data;
			});

		this.navbarService.getPointerVisible().subscribe((visible) => {
			this.hidePointer = !visible;
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	route(button: any) {
		switch (button.type) {
			case 'routerLink':
				this.tab = ['admin', button.route];
				this.router.navigate(this.tab);
				break;
			case 'staticButton':
				if (button.externalApp) {
					window.location.href = button.externalApp;
				} else {
					window.open(button.link);
				}
				break;
			case 'openMenu':
				if (button.id == 'explore') {
					this.currentView$ = new BehaviorSubject<string>(this.storage.getItem('explore_page') || 'pass_search');
					const pagesDialog = this.dialog.open(PagesDialogComponent, {
						panelClass: 'consent-dialog-container',
						backdropClass: 'invis-backdrop',
						data: {
							trigger: document.getElementById('explore'),
							pages: Object.values(this.views),
							selectedPage: this.views[this.currentView$.getValue()],
						},
					});

					pagesDialog
						.afterClosed()
						.pipe(
							tap(() => UNANIMATED_CONTAINER.next(false)),
							filter((res) => !!res)
						)
						.subscribe((action) => {
							this.tab = ['admin', button.route];
							this.router.navigate(this.tab);
							this.componentService.sendClickEvent(action);
							this.currentView$.next(action);
							this.storage.setItem('explore_page', action);
							this.cdr.detectChanges();
						});
				}
				break;
		}
	}

	openSettings(event) {
		if (!this.selectedSettings) {
			this.selectedSettings = true;
			const target = new ElementRef(event.currentTarget);
			UNANIMATED_CONTAINER.next(true);
			const settingsRef: MatDialogRef<SettingsComponent> = this.dialog.open(SettingsComponent, {
				panelClass: 'calendar-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					trigger: target,
					isSwitch: this.showButton,
					darkBackground: this.darkTheme.isEnabled$.value,
					introsData: this.introsData,
					showNotificationBadge: this.showNotificationBadge,
					adjustForScroll: true,
				},
			});

			settingsRef.afterClosed().subscribe((action) => {
				UNANIMATED_CONTAINER.next(false);
				this.selectedSettings = false;
				if (action === 'signout') {
					this.router.navigate(['sign-out']);
				} else if (action === 'switch') {
					this.router.navigate(['main', 'passes']);
				} else if (action === 'profile') {
					this.dialog.open(MyProfileDialogComponent, {
						panelClass: 'sp-form-dialog',
						width: '425px',
						height: '500px',
					});
				} else if (action === 'getStarted') {
					this.router.navigate(['admin/gettingstarted']);
				} else if (action === 'about') {
					window.open('https://smartpass.app/about');
				} else if (action === 'appearance') {
					this.dialog.open(SpAppearanceComponent, {
						panelClass: 'sp-form-dialog',
					});
				} else if (action === 'language') {
					this.dialog.open(SpLanguageComponent, {
						panelClass: 'sp-form-dialog',
					});
				} else if (action === 'wishlist') {
					window.open('https://wishlist.smartpass.app');
				} else if (action === 'support') {
					window.open('https://www.smartpass.app/support');
				} else if (action === 'bug') {
					window.open('https://www.smartpass.app/bugreport');
				} else if (action === 'privacy') {
					window.open('https://www.smartpass.app/privacy?new=true');
				} else if (action === 'refer') {
					if (this.introsData.referral_reminder.universal && !this.introsData.referral_reminder.universal.seen_version) {
						this.userService.updateIntrosRequest(this.introsData, 'universal', '1');
					}
					window.open('https://www.smartpass.app/referrals');
				}
			});
		}
	}

	setCurrentUnderlinePos(refsArray: QueryList<ElementRef>, buttonsContainer: ElementRef, timeout: number = 50) {
		setTimeout(() => {
			const tabRefsArray = refsArray.toArray();
			const selectedTabRef = this.buttons.findIndex((button) => button.route === this.currentTab);
			if (tabRefsArray[selectedTabRef]) {
				this.selectTab(tabRefsArray[selectedTabRef].nativeElement, buttonsContainer.nativeElement);
			}
		}, timeout);
	}

	selectTab(evt: HTMLElement, container: HTMLElement) {
		const containerRect = container.getBoundingClientRect();
		const selectedTabRect = (evt as HTMLElement).getBoundingClientRect();
		setTimeout(() => {
			this.pts = Math.round(selectedTabRect.top - containerRect.top) + 'px';
		}, 10);
	}

	isSelected(route: string) {
		return this.tab.includes(route);
	}
	hasRoles(roles: string[]): Observable<boolean> {
		return this.userService.userData.pipe(map((u) => roles.every((_role) => u.roles.includes(_role))));
	}

	protected readonly FLAGS = FLAGS;
}
