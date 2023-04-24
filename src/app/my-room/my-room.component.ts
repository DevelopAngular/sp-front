import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, interval, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { Util } from '../../Util';
import { mergeObject } from '../live-data/helpers';
import { LiveDataService } from '../live-data/live-data.service';
import { Location } from '../models/Location';
import { User } from '../models/User';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { TimeService } from '../services/time.service';
import { CalendarComponent } from '../admin/calendar/calendar.component';
import { concatMap, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { LocationsService } from '../services/locations.service';
import { RepresentedUser } from '../navbar/navbar.component';
import { UserService } from '../services/user.service';
import { ScreenService } from '../services/screen.service';
import { SortMenuComponent } from '../sort-menu/sort-menu.component';
import { MyRoomAnimations } from './my-room.animations';
import { KioskLogin, KioskLoginResponse, KioskModeService } from '../services/kiosk-mode.service';
import { bumpIn } from '../animations';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpService } from '../services/http-service';
import { ScrollPositionService } from '../scroll-position.service';
import { DeviceDetection } from '../device-detection.helper';
import { HallPassesService } from '../services/hall-passes.service';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import * as moment from 'moment';
import { CheckForUpdateService } from '../services/check-for-update.service';
import { RoomCheckinCodeDialogComponent } from './room-checkin-code-dialog/room-checkin-code-dialog.component';
import { KioskModeDialogComponent } from '../kiosk-mode/kiosk-mode-dialog/kiosk-mode-dialog.component';
import { Pinnable } from '../models/Pinnable';

@Component({
	selector: 'app-my-room',
	templateUrl: './my-room.component.html',
	styleUrls: ['./my-room.component.scss'],
	animations: [
		MyRoomAnimations.calendarTrigger,
		MyRoomAnimations.collectionsBlockTrigger,
		MyRoomAnimations.headerTrigger,
		MyRoomAnimations.calendarIconTrigger,
		bumpIn,
	],
})
export class MyRoomComponent implements OnInit, OnDestroy {
	private scrollableAreaName: string = 'MyRoom';
	private scrollableArea: HTMLElement;

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
						console.log(scrollOffset);
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

	@ViewChild('calendar') calendar: ElementRef;

	public activePasses: any;
	public originPasses: any;
	public destinationPasses: any;

	public inputValue: string = '';
	public user: User;
	private effectiveUser: RepresentedUser;
	public isStaff: boolean = false;
	public roomOptions: Location[];
	public showAsOriginRoom: boolean = true;
	public selectedLocation: Location;
	private optionsOpen: boolean = false;
	private canView: boolean = false;
	public userLoaded: boolean = false;

	private buttonDown: boolean;

	private searchQuery$: BehaviorSubject<string> = new BehaviorSubject('');
	public searchDate$: BehaviorSubject<Date>  = new BehaviorSubject<Date>(null);
	private selectedLocation$: ReplaySubject<Location[]> = new ReplaySubject<Location[]>(1);
	private pinnables$: Observable<Pinnable[]> = this.passesService.getPinnablesRequest().pipe(filter((r: Pinnable[]) => !!r.length));
	private pinnables: Pinnable[];
	public schoolsLength$: Observable<number>;

	public searchPending$: Subject<boolean> = new Subject<boolean>();

	public hasPasses: Observable<boolean> = of(false);
	public passesLoaded: Observable<boolean> = of(false);
	public isEnableProfilePictures$: Observable<boolean>;

	private destroy$: Subject<void> = new Subject();

	private optionsClick: boolean;

	private isCalendarShowed: boolean;

	private isCalendarClick: boolean;

	public isSearchBarClicked: boolean;

	public resetValue: Subject<string> = new Subject();

	public currentPasses$: Subject<void> = new Subject();

	public isUpdateBar$: Subject<any>;

	public currentPassesDates: Map<string, number> = new Map();
	private holdScrollPosition: number = 0;

	public isIOSTablet: boolean = false;
	public UI: boolean = false;

	constructor(
		private liveDataService: LiveDataService,
		private timeService: TimeService,
		private locationService: LocationsService,
		private passesService: HallPassesService,
		public darkTheme: DarkThemeSwitch,
		public dialog: MatDialog,
		public userService: UserService,
		public kioskMode: KioskModeService,
		private sanitizer: DomSanitizer,
		private http: HttpService,
		public screenService: ScreenService,
		public router: Router,
		private scrollPosition: ScrollPositionService,
		private updateService: CheckForUpdateService,
		private titleService: Title
	) {
		this.setSearchDate(this.timeService.nowDate());

		const selectedLocationArray$: Observable<Location[]> = this.selectedLocation$.pipe(
			map((location) => {
				return location && location.length ? location.map((l) => Location.fromJSON(l)) : [];
			})
		);
		combineLatest(selectedLocationArray$, this.searchDate$, this.searchQuery$.pipe(map((s) => ({ search_query: s })))).subscribe(
			([locations, date, query]) => {
				this.liveDataService.getMyRoomActivePassesRequest(
					mergeObject({ sort: '-created', search_query: '' }, of(query)),
					{ type: 'location', value: locations },
					date
				);
				this.liveDataService.getFromLocationPassesRequest(mergeObject({ sort: '-created', search_query: '' }, of(query)), locations, date);
				this.liveDataService.getToLocationPassesRequest(mergeObject({ sort: '-created', search_query: '' }, of(query)), locations, date);
			}
		);

		this.activePasses = this.liveDataService.myRoomActivePasses$;
		this.originPasses = this.liveDataService.fromLocationPasses$;
		this.destinationPasses = this.liveDataService.toLocationPasses$;
	}

	private setSearchDate(date: Date): void {
		date.setHours(0);
		date.setMinutes(0);
		this.searchDate$.next(date);
	}

	get buttonState(): string {
		return this.buttonDown ? 'down' : 'up';
	}

	private get searchDate(): Date {
		return this.searchDate$.value;
	}

	get showKioskModeButton() {
		return this.selectedLocation || this.roomOptions.length === 1;
	}

	get dateDisplay() {
		return Util.formatDateTime(this.searchDate).split(',')[0];
	}

	get myRoomHeaderColor() {
		return this.darkTheme.getColor({ dark: '#FFFFFF', white: '#1F195E' });
	}
	get error() {
		return !this.isStaff || (this.isStaff && !this.roomOptions.length) || !this.canView;
	}

	public ngOnInit(): void {

		this.isIOSTablet = DeviceDetection.isIOSTablet();
		this.isUpdateBar$ = this.updateService.needToUpdate$;
		this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;
		this.schoolsLength$ = this.http.schoolsLength$;
		combineLatest(
			this.userService.user$.pipe(
				filter((u) => !!u),
				map((u) => User.fromJSON(u))
			),
			this.userService.effectiveUser
		)
			.pipe(
				tap(([cu, eu]) => {
					this.user = cu;
					this.effectiveUser = eu;
					this.isStaff = cu.isAssistant() ? eu.roles.includes('_profile_teacher') : cu.roles.includes('_profile_teacher');
					this.canView = this.user.roles.includes('access_teacher_room');
				}),
				switchMap(([cu, eu]) => {
					return combineLatest(
						this.locationService
							.getLocationsWithTeacherRequest(this.user.isAssistant() ? this.effectiveUser.user : this.user)
							.pipe(filter((res: any[]) => !!res.length)),
						this.locationService.myRoomSelectedLocation$
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe(([locations, selected]: [Location[], Location]) => {
				this.roomOptions = locations;
				this.UI = this.isStaff && this.roomOptions.length && this.canView;
				if (!selected) {
					this.selectedLocation = locations[0];
					this.selectedLocation$.next([locations[0]]);
				} else {
					this.selectedLocation = selected;
					this.selectedLocation$.next([selected]);
				}
				this.titleService.setTitle(`${this.selectedLocation.title} | SmartPass`);
				this.userLoaded = true;
			});

		this.selectedLocation$
			.pipe(
				takeUntil(this.destroy$),
				filter((res: any[]) => !!res.length),
				switchMap((locations: Location[]) => {
					return this.passesService.getAggregatedPasses(locations.map((loc) => loc.id));
				})
			)
			.subscribe((res) => {
				this.currentPassesDates.clear();
				res.forEach((pass, i) => {
					this.currentPassesDates.set(new Date(pass.pass_date).toDateString(), i);
				});
			});

		this.pinnables$
			.pipe(
				tap((res: Pinnable[]) => {
					this.pinnables = res;
				}),
				// listen for the pinnable's show as origin room setting being changed
				// to show a toast if the user tries to create a pass.
				switchMap(() => {
					return this.locationService.listenPinnableSocket();
				}),
				tap((res) => {
					this.locationService.updatePinnableSuccessState(res.data);
					this.showAsOriginRoom = res.data.show_as_origin_room;
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();

		this.hasPasses = combineLatest(
			this.liveDataService.myRoomActivePassesTotalNumber$,
			this.liveDataService.fromLocationPassesTotalNumber$,
			this.liveDataService.toLocationPassesTotalNumber$,
			(l1, l2, l3) => l1 + l2 + l3 > 0
		);
		this.passesLoaded = combineLatest(
			this.liveDataService.myRoomActivePassesLoaded$,
			this.liveDataService.fromLocationPassesLoaded$,
			this.liveDataService.toLocationPassesLoaded$,
			(l1, l2, l3) => l1 && l2 && l3
		).pipe(
			filter((v) => v),
			tap((res) => this.searchPending$.next(!res))
		);
	}

	public ngOnDestroy(): void {
		if (this.scrollableArea && this.scrollableAreaName) {
			this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
		}
		this.destroy$.next();
		this.destroy$.complete();
		this.locationService.myRoomSelectedLocation$.next(this.selectedLocation);
	}

	public getSelectedDateText(date): string {
		if (moment(date).isSame(moment(), 'day')) {
			return 'Today';
		} else if (moment(date).isSame(moment().add(1, 'day'), 'day')) {
			return 'Tomorrow';
		} else if (moment(date).isSame(moment().subtract(1, 'day'), 'day')) {
			return 'Yesterday';
		} else {
			return moment(date).format('MMM DD');
		}
	}

	getIcon(icon): string {
		return this.darkTheme.getIcon({
			iconName: icon,
			darkFill: 'White',
			lightFill: 'Navy',
			setting: null,
		});
	}

	chooseDate(event): void  {
		const target = event.currentTarget;
		const DR = this.dialog.open(CalendarComponent, {
			panelClass: 'calendar-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: target,
				previousSelectedDate: this.searchDate,
				dotsDates: this.currentPassesDates,
			},
		});
		DR.afterClosed().subscribe((_date) => {
			if (_date.date && _date.date !== '') {
				this.setSearchDate(_date.date);
			}
		});
	}

	// used to prevent multiple clicks while dialog hasn't been opened
	public setRoomToKioskModeProcessing: boolean;

	public setRoomToKioskMode(): void {
		let pin: Pinnable;
		if (this.selectedLocation.category) {
			pin = this.pinnables.find((p: Pinnable) => p.category === this.selectedLocation.category);
		} else {
			pin = this.pinnables.find((p: Pinnable) => p.location.id === this.selectedLocation.id);
		}
		if (pin) {
			this.showAsOriginRoom = pin.show_as_origin_room;
		}
		if (this.setRoomToKioskModeProcessing) {
			return;
		}

		const loginServer = this.http.getServerFromStorage();
		if (!loginServer) {
			throw new Error('No login server!');
		}

		this.setRoomToKioskModeProcessing = true;

		let kioskLogin: KioskLogin;

		this.kioskMode
			.getKioskModeLogin(this.selectedLocation.id)
			.pipe(
				// Get Dedicated Login details
				takeUntil<KioskLoginResponse>(this.destroy$),
				map(({ results }) => results), // de-nest server response
				finalize(() => (this.setRoomToKioskModeProcessing = false)),
				concatMap((kioskLoginInfo) => {
					kioskLogin = kioskLoginInfo;
					const dialogRef = this.dialog.open(KioskModeDialogComponent, {
						panelClass: 'accounts-profiles-dialog',
						backdropClass: 'custom-bd',
						width: '425px',
						height: '480px',
						data: { selectedRoom: this.selectedLocation, loginData: kioskLoginInfo, showAsOriginRoom: this.showAsOriginRoom },
					});

					return dialogRef.afterClosed().pipe(
						filter(Boolean),
						concatMap(() => {
							this.router.navigate(['main/kioskMode/settings']);
							return this.kioskMode.enterKioskMode$.pipe(filter(Boolean));
						}),
						tap(() => {
							let kioskRoom;
							if (this.roomOptions.length === 1) {
								kioskRoom = this.roomOptions[0];
							} else {
								kioskRoom = Object.assign({}, this.selectedLocation);
							}
							this.kioskMode.setCurrentRoom(kioskRoom);
							this.router.navigate(['main/kioskMode']);
						})
					);
				})
			)
			.subscribe();
	}

	public openRoomCodeDialog(): void {
		this.dialog.open(RoomCheckinCodeDialogComponent, {
			panelClass: 'checkin-room-code-dialog-container',
			backdropClass: 'custom-bd',
			maxWidth: '100vw',
			maxHeight: '100vh',
			height: '100vh',
			width: '100vw',
			data: { roomData: this.selectedLocation },
		});
	}

	public onSearch(search: string): void {
		this.inputValue = search;
		this.searchPending$.next(true);
		this.searchQuery$.next(search);
	}

	private displayOptionsPopover(target: HTMLElement): void {
		if (!this.optionsOpen && this.roomOptions && this.roomOptions.length > 1) {
			this.optionsOpen = true;
			UNANIMATED_CONTAINER.next(true);
			const optionDialog = this.dialog.open(DropdownComponent, {
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: {
					heading: 'CHANGE ROOM',
					locations: this.roomOptions,
					selectedLocation: this.selectedLocation,
					trigger: target,
					scrollPosition: this.holdScrollPosition,
				},
			});

			optionDialog
				.afterClosed()
				.pipe(
					tap(() => {
						UNANIMATED_CONTAINER.next(false);
						this.optionsOpen = false;
					}),
					filter((res) => !!res)
				)
				.subscribe((data) => {
					console.log('data : ', data);
					this.holdScrollPosition = data.scrollPosition;
					this.selectedLocation = data.selectedRoom === 'all_rooms' ? null : data.selectedRoom;
					this.titleService.setTitle(`${this.selectedLocation.title} | SmartPass`);
					this.selectedLocation$.next(data.selectedRoom !== 'all_rooms' ? [data.selectedRoom] : this.roomOptions);
				});
		}
	}

	public showOptions(target: HTMLElement): void {
		this.optionsClick = !this.optionsClick;
		if (this.screenService.isDeviceMid || this.screenService.isIpadWidth) {
			this.openOptionsMenu();
		} else {
			this.displayOptionsPopover(target);
		}
	}

	public calendarClick(): void {
		this.isCalendarShowed = !this.isCalendarShowed;
		this.isCalendarClick = !this.isCalendarClick;
	}

	public toggleSearchBar(): void {
		this.isSearchBarClicked = !this.isSearchBarClicked;
	}

	public cleanSearchValue(): void {
		this.resetValue.next('');
		this.inputValue = '';
		this.searchQuery$.next('');
		this.toggleSearchBar();
	}

	public onDate(event): void {
		this.setSearchDate(event[0]._d);
	}

	public openOptionsMenu(): void {
		const dialogRef = this.dialog.open(SortMenuComponent, {
			position: { bottom: '0' },
			panelClass: 'options-dialog',
			data: {
				title: 'change room',
				selectedItem: this.selectedLocation,
				items: this.roomOptions,
				showAll: true,
			},
		});

		dialogRef.componentInstance.onListItemClick.subscribe((location) => {
			console.log('location : ', location, this.roomOptions);
			this.selectedLocation = location;
			this.titleService.setTitle(`${this.selectedLocation.title} | SmartPass`);
			this.selectedLocation$.next(this.selectedLocation !== null ? [this.selectedLocation] : this.roomOptions);
		});
	}

	public calendarSlideState(stateName: string): string {
		switch (stateName) {
			case 'leftRight':
				return this.isCalendarClick ? 'slideLeft' : 'slideRight';
			case 'topBottom':
				return this.isCalendarClick ? 'slideTop' : 'slideBottom';
		}
	}

	get collectionsSlideState(): string {
		if (!this.screenService.isIpadWidth && this.isCalendarClick && !this.isSearchBarClicked) {
			return 'collectionsTop';
		}

		if (!this.screenService.isIpadWidth && !this.isCalendarClick && !this.isSearchBarClicked) {
			return 'collectionsBottom';
		}
	}

	get collectionWidth(): string {
		let maxWidth = 755;

		if (this.screenService.createCustomBreakPoint(maxWidth)) {
			maxWidth = 336;
		}

		if (
			(this.screenService.createCustomBreakPoint(850) && this.isCalendarClick && !this.isIOSTablet && !this.is670pxBreakPoint) ||
			(this.screenService.createCustomBreakPoint(850) && this.isCalendarClick && !this.is670pxBreakPoint)
		) {
			maxWidth = 336;
		}
		return maxWidth + 'px';
	}

	get is670pxBreakPoint(): boolean {
		const customBreakPoint = 670;
		return this.screenService.createCustomBreakPoint(customBreakPoint);
	}
}
