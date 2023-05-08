import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
// TODO: Replace combineLatest with non-deprecated implementation
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, forkJoin, interval, merge, Observable, of, Subject, timer } from 'rxjs';
import {
	concatMap,
	distinctUntilChanged,
	filter,
	map,
	pluck,
	publishReplay,
	refCount,
	startWith,
	switchMap,
	take,
	takeUntil,
	tap,
	withLatestFrom,
} from 'rxjs/operators';
import { CreatePassDialogData } from '../create-hallpass-forms/create-hallpass-forms.component';
import { HallPassFilter, LiveDataService } from '../live-data/live-data.service';
import { exceptPasses } from '../models';
import { HallPass } from '../models/HallPass';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { DataService } from '../services/data-service';
import { TimeService } from '../services/time.service';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { NavbarDataService } from '../main/navbar-data.service';
import { PassesAnimations } from './passes.animations';
import { ScreenService } from '../services/screen.service';
import { ScrollPositionService } from '../scroll-position.service';
import { UserService } from '../services/user.service';
import { DeviceDetection } from '../device-detection.helper';
import { NotificationButtonService } from '../services/notification-button.service';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';

import { HttpService } from '../services/http-service';
import { HallPassesService } from '../services/hall-passes.service';
import { SideNavService } from '../services/side-nav.service';
import { StartPassNotificationComponent } from './start-pass-notification/start-pass-notification.component';
import { LocationsService } from '../services/locations.service';
import * as moment from 'moment';
import { PassLimitService } from '../services/pass-limit.service';
import { PassLimitInfo } from '../models/HallPassLimits';
import { MainHallPassFormComponent } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { Title } from '@angular/platform-browser';
import { FeatureFlagService, FLAGS } from '../services/feature-flag.service';
import { WaitingInLinePass } from '../models/WaitInLine';
import { Invitation } from '../models/Invitation';
import { InlineWaitInLineCardComponent } from '../pass-cards/inline-wait-in-line-card/inline-wait-in-line-card.component';
import { Util } from '../../Util';
import { RepresentedUser } from '../navbar/navbar.component';
import { AppState } from '../ngrx/app-state/app-state';
import { ReferralModalService } from '../services/referral-modal.service';
@Component({
	selector: 'app-passes',
	templateUrl: './passes.component.html',
	styleUrls: ['./passes.component.scss'],
	animations: [
		PassesAnimations.OpenOrCloseRequests,
		PassesAnimations.PassesSlideTopBottom,
		PassesAnimations.RequestCardSlideInOut,
		PassesAnimations.HeaderSlideInOut,
		PassesAnimations.HeaderSlideTopBottom,
		PassesAnimations.PreventInitialChildAnimation,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassesComponent implements OnInit, OnDestroy {
	private scrollableAreaName = 'Passes';
	private scrollableArea: HTMLElement;

	@ViewChild('animatedHeader') animatedHeader: ElementRef<HTMLElement>;

	@ViewChild('passesWrapper') passesWrapper: ElementRef<HTMLElement>;

	@ViewChild('scrollableArea') set scrollable(scrollable: ElementRef) {
		if (scrollable) {
			this.scrollableArea = scrollable.nativeElement;

			const updatePosition = function () {
				const scrollObserver = new Subject();
				const initialHeight = this.scrollableArea.scrollHeight;
				const scrollOffset = this.scrollPosition.getComponentScroll(this.scrollableAreaName);

				/**
				 * If the scrollable area has static height, call `scrollTo` immediately,
				 * otherwise additional subscription will perform once if the height changes
				 */

				if (scrollOffset) {
					this.scrollableArea.scrollTo({ top: scrollOffset });
				}

				interval(50)
					.pipe(
						filter(() => {
							return initialHeight < (scrollable.nativeElement as HTMLElement).scrollHeight && scrollOffset;
						}),
						takeUntil(scrollObserver)
					)
					.subscribe((v) => {
						if (v) {
							this.scrollableArea.scrollTo({ top: scrollOffset });
							scrollObserver.next();
							scrollObserver.complete();
							updatePosition();
						}
					});
			}.bind(this);
			updatePosition();
		}
	}

	// pass observables
	futurePasses: Observable<HallPass[]>;
	activePasses: Observable<HallPass[]>;
	pastPasses: Observable<HallPass[]>;
	waitInLinePasses: Observable<WaitingInLinePass[]>;

	// request observables
	sentRequests: Observable<Request[]> | Observable<Invitation[]>;
	receivedRequests: Observable<Request[]> | Observable<Invitation[]>;

	// currently active pass, request or wait-in-line, for student side, and their active states
	isActivePass$: Observable<boolean>;
	isActiveRequest$: Observable<boolean>;
	isActiveWaitInLine$: Observable<boolean>;
	currentPass$ = new BehaviorSubject<HallPass>(null);
	currentRequest$ = new BehaviorSubject<Request>(null);
	currentWaitInLine$ = new BehaviorSubject<WaitingInLinePass>(null);
	fullScreenWaitInLineRef: MatDialogRef<InlineWaitInLineCardComponent>;

	inboxHasItems: Observable<boolean> = of(null);
	passesHaveItems: Observable<boolean> = of(false);

	inboxLoaded: Observable<boolean> = of(false);
	passesLoaded: Observable<boolean> = of(false);

	filterActivePass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
	filterFuturePass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
	filterReceivedPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
	filterSendPass$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(null);
	filterExpiredPass$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	expiredPassesSelectedSort$: Observable<string>;
	isEmptyPassFilter: boolean;

	showEmptyState: Observable<boolean>;

	destroy$: Subject<any> = new Subject();

	user$: Observable<User>;
	user: User;
	passLimitInfo: PassLimitInfo;
	isStaff = false;
	isStudent = false;
	currentScrollPosition: number;
	isSmartphone = DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile();
	isMobile = DeviceDetection.isMobile();

	isUpdateBar$: Subject<any>;
	isInboxClicked$: Observable<boolean>;

	cursor = 'pointer';

	waitInLineTitle: Observable<string> = timer(0, 750).pipe(
		takeUntil(this.destroy$),
		map((count) => `Waiting in Line${'.'.repeat(count % 4)}`)
	);

	public schoolsLength$: Observable<number>;
	private createHallPassDialogRef: MatDialogRef<MainHallPassFormComponent>;

	@HostListener('window:resize')
	checkDeviceWidth() {
		if (this.screenService.isDeviceLargeExtra) {
			this.cursor = 'default';
		}
	}

	@HostListener('window:scroll', ['$event'])
	scroll(event) {
		this.currentScrollPosition = event.currentTarget.scrollTop;
		if (!!this.passesService.expiredPassesNextUrl$.getValue()) {
			if (event.currentTarget.offsetHeight + event.target.scrollTop >= event.currentTarget.scrollHeight - 600) {
				combineLatest(this.expiredPassesSelectedSort$.pipe(take(1)), this.liveDataService.expiredPassesLoading$.pipe(take(1)))
					.pipe(
						filter(([sort, loading]) => !loading),
						takeUntil(this.destroy$)
					)
					.subscribe(([sort, loading]) => {
						this.liveDataService.getExpiredPassesRequest(this.user, sort, this.passesService.expiredPassesNextUrl$.getValue());
					});
			}
		}
	}

	@HostListener('window:popstate', ['$event'])
	onPopState() {
		if (this.isMobile) {
			this.navbarService.inboxClick$.next(false);
		}
	}

	showInboxAnimated() {
		return this.dataService.inboxState;
	}

	get showProfilePictures$(): Observable<boolean> {
		return combineLatest(
			this.userService.isEnableProfilePictures$,
			this.user$.pipe(
				filter((r) => !!r),
				map((u) => !User.fromJSON(u).isStudent() && u.show_profile_pictures === 'everywhere')
			),
			(c1, c2) => c1 && c2
		);
	}

	get isWaitInLine(): boolean {
		return this.featureService.isFeatureEnabled(FLAGS.WaitInLine);
	}

	constructor(
		public dataService: DataService,
		public dialog: MatDialog,
		private _zone: NgZone,
		private liveDataService: LiveDataService,
		private timeService: TimeService,
		private navbarService: NavbarDataService,
		public screenService: ScreenService,
		public darkTheme: DarkThemeSwitch,
		private scrollPosition: ScrollPositionService,
		private userService: UserService,
		private shortcutsService: KeyboardShortcutsService,
		private notificationButtonService: NotificationButtonService,
		private httpService: HttpService,
		private passesService: HallPassesService,
		private sideNavService: SideNavService,
		private locationsService: LocationsService,
		private passLimitsService: PassLimitService,
		private cdr: ChangeDetectorRef,
		private titleService: Title,
		private featureService: FeatureFlagService,
		private store: Store<AppState>,
		private referralModalService: ReferralModalService
	) {
		this.userService.user$
			.pipe(
				filter(Boolean),
				take(1),
				map((user) => {
					this.user = User.fromJSON(user);
					this.isStaff = this.user.isStaff();
					this.isStudent = this.user.isStudent();
					if (this.isStaff) {
						this.titleService.setTitle('SmartPass');
						this.dataService.updateInbox(true);

						const user$ = this.user.isAssistant()
							? this.userService.effectiveUser.pipe(
									filter<RepresentedUser>(Boolean),
									map((response) => response.user)
							  )
							: of(this.user);

						this.waitInLinePasses = user$.pipe(
							concatMap((user) => {
								return this.liveDataService.watchWaitingInLinePasses({ type: 'issuer', value: user }).pipe(
									map((passes) => {
										return passes.filter((p) => p.issuer.id == user.id);
									})
								);
							})
						);
					} else {
						this.titleService.setTitle(`${this.user.display_name} | SmartPass`);
					}
					return this.isStudent;
				}),
				concatMap((isStudent) => {
					if (!isStudent) {
						this.receivedRequests = this.liveDataService.requests$;
						this.sentRequests = this.liveDataService.invitations$;
						this.passLimitInfo = { showPasses: false };
						return of(null);
					}

					this.receivedRequests = this.liveDataService.invitations$;
					this.sentRequests = this.liveDataService.requests$.pipe(map((req) => req.filter((r) => !!r.request_time)));

					return merge(
						this.liveDataService.watchActiveHallPasses(new Subject<HallPassFilter>()).pipe(distinctUntilChanged((a, b) => a.length === b.length)),
						this.passLimitsService.watchPassLimits(),
						this.passLimitsService.watchIndividualPassLimit(this.user.id)
					).pipe(
						concatMap(() =>
							forkJoin({
								studentPassLimit: this.passLimitsService.getStudentPassLimit(this.user.id),
								remainingLimit: this.passLimitsService.getRemainingLimits({ studentId: this.user.id }),
							})
						),
						map(
							({ studentPassLimit, remainingLimit }): PassLimitInfo => ({
								max: studentPassLimit.passLimit,
								showPasses: !studentPassLimit.noLimitsSet && !studentPassLimit.isUnlimited && studentPassLimit.passLimit !== null,
								current: remainingLimit.remainingPasses,
							})
						),
						tap((data) => {
							this.passLimitInfo = data;
							if (this.createHallPassDialogRef && this.createHallPassDialogRef.getState() === MatDialogState.OPEN) {
								this.createHallPassDialogRef.componentInstance.FORM_STATE.passLimitInfo = this.passLimitInfo;
								this.cdr.detectChanges();
							}
						})
					);
				})
			)
			.subscribe(() => {});

		this.isActivePass$ = combineLatest(this.currentPass$, this.timeService.now$, (pass, now) => {
			return pass !== null && new Date(pass.start_time).getTime() <= now.getTime() && now.getTime() < new Date(pass.end_time).getTime();
		}).pipe(publishReplay(1), refCount());

		this.isActiveRequest$ = this.currentRequest$.pipe(
			map((request) => {
				return request !== null && !request.request_time;
			})
		);

		this.isActiveWaitInLine$ = this.currentWaitInLine$.pipe(map(Boolean));
		this.currentWaitInLine$
			.pipe(
				takeUntil(this.destroy$),
				filter((wilPass) => wilPass?.isReadyToStart() && this.fullScreenWaitInLineRef?.getState() !== MatDialogState.OPEN)
			)
			.subscribe({
				next: (wilPass: WaitingInLinePass) => {
					this.fullScreenWaitInLineRef = this.dialog.open(InlineWaitInLineCardComponent, {
						panelClass: ['overlay-dialog', 'teacher-pass-card-dialog-container'],
						backdropClass: 'custom-backdrop',
						disableClose: true,
						closeOnNavigation: true,
						data: {
							pass: wilPass,
							nextInLine: true,
							forStaff: this.isStaff,
						},
					});

					this.fullScreenWaitInLineRef.afterOpened().subscribe({
						next: () => {
							const solidColor = Util.convertHex(wilPass.color_profile.solid_color, 70);
							this.screenService.customBackdropStyle$.next({
								background: `linear-gradient(0deg, ${solidColor} 100%, rgba(0, 0, 0, 0.3) 100%)`,
							});
							this.screenService.customBackdropEvent$.next(true);
						},
					});

					this.fullScreenWaitInLineRef.afterClosed().subscribe({
						next: () => {
							this.screenService.customBackdropEvent$.next(false);
							this.screenService.customBackdropStyle$.next(null);
						},
					});
				},
			});

		this.dataService.currentUser
			.pipe(
				takeUntil(this.destroy$),
				switchMap((user: User) => {
					return user.isStudent() ? this.liveDataService.watchActivePassLike(user) : of(null);
				})
			)
			.subscribe((passLike) => {
				this._zone.run(() => {
					if ((passLike instanceof HallPass || passLike instanceof Request || passLike instanceof WaitingInLinePass) && this.currentScrollPosition) {
						this.scrollableArea.scrollTo({ top: 0 });
					}
					this.currentPass$.next(passLike instanceof HallPass ? passLike : null);
					this.currentRequest$.next(passLike instanceof Request ? passLike : null);

					if (passLike instanceof WaitingInLinePass) {
						const currentWil = this.currentWaitInLine$.value;
						if (currentWil?.line_position != passLike.line_position || currentWil?.missed_start_attempts != passLike.missed_start_attempts) {
							this.currentWaitInLine$.next(passLike);
						}
					} else {
						this.currentWaitInLine$.next(null);
					}
				});
			});

		merge(this.passesService.watchMessageAlert(), this.passesService.watchAllEndingPasses())
			.pipe(
				filter(() => !this.isStaff),
				switchMap(({ action, data }) => {
					if (action === 'message.alert' && !this.dialog.getDialogById('startNotification')) {
						const isFirstPass: boolean = data.type.includes('first_pass');
						this.screenService.customBackdropEvent$.next(true);
						const SPNC = this.dialog.open(StartPassNotificationComponent, {
							id: 'startNotification',
							panelClass: 'main-form-dialog-container',
							backdropClass: 'notification-backdrop',
							disableClose: true,
							hasBackdrop: false,
							data: {
								title: isFirstPass ? 'Quick Reminder' : 'You didn’t end your pass last time…',
								subtitle: 'When you come back to the room, remember to end your pass!',
							},
						});
						SPNC.afterClosed().subscribe(() => this.screenService.customBackdropEvent$.next(false));
					} else if (action === 'hall_pass.end') {
						if (this.dialog.getDialogById('startNotification')) {
							this.dialog.getDialogById('startNotification').close();
							return of(true);
						}
					}
					return of(false);
				})
			)
			.subscribe((res) => {
				if (res) {
					this.screenService.customBackdropEvent$.next(false);
				}
			});
	}

	ngOnInit() {
		this.futurePasses = this.liveDataService.futurePasses$;
		this.activePasses = this.getActivePasses();
		this.pastPasses = this.liveDataService.expiredPasses$;
		this.expiredPassesSelectedSort$ = this.passesService.passFilters$.pipe(
			filter((res) => !!res),
			map((filters) => {
				this.isEmptyPassFilter = !filters['past-passes'].default;
				return filters['past-passes'].default;
			})
		);

		this.referralModalService.openNuxReferralModal();

		this.schoolsLength$ = this.httpService.schoolsLength$;
		this.user$ = this.userService.user$;
		const notifBtnDismissExpires = moment(JSON.parse(localStorage.getItem('notif_btn_dismiss_expiration')));
		if (this.notificationButtonService.dismissExpirtationDate === notifBtnDismissExpires) {
			this.notificationButtonService.dismissButton$.next(false);
		}

		this.isInboxClicked$ = this.navbarService.inboxClick$.asObservable();

		this.shortcutsService.onPressKeyEvent$
			.pipe(
				pluck('key'),
				takeUntil(this.destroy$),
				filter((key) => key[0] === 'n' || key[0] === 'f')
			)
			.subscribe((key) => {
				if (key[0] === 'n') {
					this.showMainForm(false);
				} else if (key[0] === 'f') {
					this.showMainForm(true);
				}
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

		this.inboxLoaded = combineLatest(this.liveDataService.requestsLoaded$, this.liveDataService.invitationsLoaded$, (l1, l2) => l1 && l2);

		this.passesHaveItems = combineLatest(
			this.liveDataService.activePassesTotalNumber$,
			this.liveDataService.futurePassesTotalNumber$,
			this.liveDataService.expiredPassesTotalNumber$
		).pipe(map(([con1, con2, con3]) => !!con1 || !!con2 || !!con3));

		this.passesLoaded = combineLatest(
			this.liveDataService.activePassesLoaded$,
			this.liveDataService.futurePassesLoaded$,
			this.liveDataService.expiredPassesLoaded$,
			(con1, con2, con3) => con1 && con2 && con3
		);

		this.showEmptyState = combineLatest(this.passesHaveItems, this.passesLoaded).pipe(map(([items, loaded]) => !items && loaded));

		if (this.screenService.isDeviceLargeExtra) {
			this.cursor = 'default';
		}

		this.httpService.globalReload$.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.locationsService.getLocationsWithConfigRequest('v1/locations?limit=1000&starred=false');
			this.locationsService.getFavoriteLocationsRequest();
		});
	}

	ngOnDestroy(): void {
		if (this.scrollableArea && this.scrollableAreaName) {
			this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
		}
		this.destroy$.next();
		this.destroy$.complete();
	}

	getActivePasses() {
		const passes$ = this.liveDataService.activePasses$.pipe(
			map((passes) => {
				return passes.filter((pass) => {
					const { isActive } = pass.calculatePassStatus();
					return isActive;
				});
			})
		);
		const excludedPasses = this.currentPass$.pipe(
			map((p) => (p !== null ? [p] : [])),
			startWith([])
		);
		return combineLatest(passes$, excludedPasses, (passes, excluded) => exceptPasses(passes, excluded));
	}

	showMainForm(forLater: boolean): void {
		this.createHallPassDialogRef = this.dialog.open(MainHallPassFormComponent, {
			closeOnNavigation: true,
			panelClass: 'main-form-dialog-container',
			backdropClass: 'custom-backdrop',
			maxWidth: '100vw',
			data: {
				forLater: forLater,
				forStaff: this.isStaff,
				forInput: true,
				passLimitInfo: this.passLimitInfo,
			} as Partial<CreatePassDialogData>,
		});
	}

	openSettings(value) {
		if (value && !this.dialog.openDialogs.length) {
			this.sideNavService.openSettingsEvent$.next(true);
		}
	}

	// TODO: Type All Filters properly
	filterPasses(collection, action) {
		const filterMap: Record<string, BehaviorSubject<string | moment.Moment>> = {
			active: this.filterActivePass$,
			future: this.filterFuturePass$,
			'expired-passes': this.filterExpiredPass$,
			'received-pass-requests': this.filterReceivedPass$,
			'sent-pass-requests': this.filterSendPass$,
		};

		if (collection in filterMap) {
			filterMap[collection].next(action);
		}
	}

	// TODO: Type All Filters properly
	prepareFilter(action, collection) {
		if (action === 'past-hour') {
			this.filterPasses(collection, action);
		} else if (action === 'today') {
			this.filterPasses(collection, action);
		} else if (action === 'past-three-days') {
			this.filterPasses(collection, action);
		} else if (action === 'past-seven-days') {
			this.filterPasses(collection, action);
		} else {
			this.filterPasses(collection, null);
		}
	}
}
