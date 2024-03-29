import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, combineLatest, forkJoin, interval, Observable, of, ReplaySubject, Subject, Subscription, zip } from 'rxjs';
import { debounceTime, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { HttpService } from '../../services/http-service';
import { Pinnable } from '../../models/Pinnable';
import { OverlayContainerComponent, RoomDialogData } from '../overlay-container/overlay-container.component';
import { PinnableCollectionComponent } from '../pinnable-collection/pinnable-collection.component';
import { isArray } from 'lodash';
import { HallPassesService } from '../../services/hall-passes.service';
import { SchoolSettingDialogComponent } from '../school-setting-dialog/school-setting-dialog.component';
import { Location } from '../../models/Location';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationsService } from '../../services/locations.service';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { AdminService } from '../../services/admin.service';
import { UNANIMATED_CONTAINER } from '../../consent-menu-overlay';
import { ScrollPositionService } from '../../scroll-position.service';
import { Onboard } from '../../models/Onboard';
import { SupportService } from '../../services/support.service';
import { UserService } from '../../services/user.service';
import * as moment from 'moment/moment';
import { FeatureFlagService, FLAGS } from '../../services/feature-flag.service';

@Component({
	selector: 'app-pass-config',
	templateUrl: './pass-config.component.html',
	styleUrls: ['./pass-config.component.scss'],
})
export class PassConfigComponent implements OnInit, OnDestroy {
	private scrollableAreaName = 'PassConfig';
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
						// console.log(scrollOffset);
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

	@ViewChild(PinnableCollectionComponent) pinColComponent;

	public pinnableCollectionBlurEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	private pendingSubject = new ReplaySubject<boolean>(1);
	public pending$ = this.pendingSubject.asObservable();

	selectedPinnables: Pinnable[] = [];
	pinnable: Pinnable;
	pinnables$: Observable<Pinnable[]>;
	pinnables: Pinnable[] = [];
	onboardProcess$: Observable<{ [id: string]: Onboard }>;
	onboardLoading$: Observable<boolean>;

	arrangedOrderForUpdating: number[];

	buttonMenuOpen: boolean;
	bulkSelect: boolean;
	bottomShadow = true;

	// // Needs for OverlayContainer opening if an admin comes from teachers profile card on Accounts&Profiles tab
	private forceSelectedLocation: Location;

	private isLoadingArranged$: Observable<boolean>;

	public loading$: Observable<boolean>;
	public loaded$: Observable<boolean>;

	destroy$ = new Subject();
	showRooms: boolean;
	globalReloadSubs: Subscription;
	showWaitInLineNux = new Subject<boolean>();
	private showRoomAsOriginNux = new Subject<boolean>();
	introsData: any;

	@HostListener('window:scroll', ['$event'])
	scroll(event) {
		if (event.currentTarget.offsetHeight + event.currentTarget.scrollTop >= event.currentTarget.scrollHeight) {
			this.bottomShadow = false;
		} else {
			this.bottomShadow = true;
		}
	}

	constructor(
		private dialog: MatDialog,
		private httpService: HttpService,
		public hallPassService: HallPassesService,
		private elRef: ElementRef,
		private activatedRoute: ActivatedRoute,
		private locationsService: LocationsService,
		private router: Router,
		public darkTheme: DarkThemeSwitch,
		private adminService: AdminService,
		private scrollPosition: ScrollPositionService,
		private supportService: SupportService,
		private userService: UserService,
		private features: FeatureFlagService
	) {}

	get headerButtonText() {
		return this.selectedPinnables.length < 1 || !this.bulkSelect ? 'Add' : 'Bulk Edit Rooms';
	}

	get headerButtonIcon() {
		return this.selectedPinnables.length < 1 || !this.bulkSelect ? './assets/Plus (White).svg' : null;
	}

	get isSelected() {
		return this.bulkSelect;
	}

	ngOnInit() {
		this.loading$ = this.hallPassService.isLoadingPinnables$;
		this.loaded$ = this.hallPassService.loadedPinnables$;
		this.isLoadingArranged$ = this.hallPassService.isLoadingArranged$;
		this.onboardLoading$ = this.adminService.loadingOnboardProcess$;

		this.globalReloadSubs = this.httpService.globalReload$
			.pipe(
				takeUntil(this.destroy$),
				tap(() => (this.onboardProcess$ = this.adminService.getOnboardProcessRequest().pipe(filter((res) => !!res)))),
				switchMap((res) => {
					return (this.pinnables$ = this.hallPassService.getPinnablesRequest().pipe(filter((r: Pinnable[]) => !!r.length)));
				}),
				map((pinnables) => {
					this.pinnables = pinnables;
				})
			)
			.subscribe();

		this.activatedRoute.queryParams
			.pipe(
				filter((qp) => Object.keys(qp).length > 0 && Object.keys(qp).length === Object.values(qp).length),
				takeUntil(this.destroy$),
				switchMap((qp: any): any => {
					const { locationId } = qp;
					this.router.navigate(['admin/passconfig']);
					return this.locationsService.getLocation(locationId);
				}),
				switchMap((location: Location) => {
					return zip(this.pinnables$.pipe(filter((res) => !!res.length)), of(location));
				})
			)
			.subscribe(([pinnables, location]) => {
				this.forceSelectedLocation = location;
				this.pinnable = pinnables.find((pnbl: Pinnable) => {
					if (pnbl.type === 'location') {
						return pnbl.location.id + '' === location.id + '';
					} else {
						return pnbl.category === location.category.substring(0, location.category.length - 8);
					}
				});

				this.selectPinnable({ action: 'room/folder_edit', selection: this.pinnable });
			});

		combineLatest(this.userService.introsData$.pipe(filter((res) => !!res)), this.userService.user$.pipe(filter((r) => !!r)))
			.pipe(debounceTime(1000), takeUntil(this.destroy$))
			.subscribe(([intros, user]) => {
				this.introsData = intros;
				if (this.features.isFeatureEnabled(FLAGS.ShowWaitInLine)) {
					const showNux = moment(user.first_login).isBefore(this.waitInLineLaunchDate) && !intros?.wait_in_line?.universal?.seen_version;
					this.showWaitInLineNux.next(showNux);
				}
				if (!this.introsData.show_as_origin_room) {
					this.showRoomAsOriginNux.next(true);
				}
			});
	}

	waitInLineLaunchDate = moment('03-15-2023', 'MM-DD-YYYY');

	ngOnDestroy() {
		if (this.scrollableArea) {
			this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
		}
		this.destroy$.next();
		this.destroy$.complete();
		if (this.globalReloadSubs) {
			this.globalReloadSubs.unsubscribe();
		}
	}

	setNewArrangedOrder(newOrder) {
		this.arrangedOrderForUpdating = newOrder.map((pin) => pin.id);
		this.updatePinnablesOrder().subscribe();
	}

	private updatePinnablesOrder() {
		return this.isLoadingArranged$.pipe(
			take(1),
			switchMap((value) => {
				if (!value) {
					return this.hallPassService.createArrangedPinnableRequest({ order: this.arrangedOrderForUpdating.join(',') });
				} else {
					return of(null);
				}
			})
		);
	}

	openSettings() {
		this.dialog.open(SchoolSettingDialogComponent, {
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
		});
	}

	toggleBulk() {
		this.bulkSelect = !this.bulkSelect;
		this.selectedPinnables = [];
	}

	buttonClicked(evnt: MouseEvent) {
		if (!this.buttonMenuOpen) {
			const target = new ElementRef(evnt.currentTarget);
			const options = [];
			options.push(
				this.genOption(
					'New Room',
					this.darkTheme.getColor({ dark: '#FFFFFF', white: '#7f879d' }),
					'newRoom',
					this.darkTheme.getIcon({ iconName: 'Room', darkFill: 'White', lightFill: 'Blue-Gray' })
				)
			);
			options.push(
				this.genOption(
					'New Folder',
					this.darkTheme.getColor({ dark: '#FFFFFF', white: '#7f879d' }),
					'newFolder',
					this.darkTheme.getIcon({ iconName: 'Folder', darkFill: 'White', lightFill: 'Blue-Gray' })
				)
			);

			UNANIMATED_CONTAINER.next(true);
			this.buttonMenuOpen = true;

			const cancelDialog = this.dialog.open(ConsentMenuComponent, {
				panelClass: 'consent-dialog-container',
				backdropClass: 'invis-backdrop',
				data: { options: options, trigger: target, adjustForScroll: true },
			});

			cancelDialog
				.afterClosed()
				.pipe(tap(() => UNANIMATED_CONTAINER.next(false)))
				.subscribe((action) => {
					this.buttonMenuOpen = false;
					if (action) {
						this.selectPinnable({ action, selection: this.selectedPinnables });
					}
				});
		}
	}

	genOption(display, color, action, icon?) {
		return { display, color, action, icon };
	}

	selectPinnable({ action, selection }) {
		if (action === 'room/folder_edit' && !isArray(selection)) {
			this.pinnable = selection;
			return this.buildData(this.pinnable.type === 'location' ? 'editRoom' : 'editFolder');
		} else if (action === 'simple') {
			this.selectedPinnables = selection;
		} else {
			this.selectedPinnables = selection;
			this.buildData(action);
		}
	}

	buildData(action: string): void {
		let data: RoomDialogData;
		const component = OverlayContainerComponent;
		switch (action) {
			case 'newRoom':
				data = {
					type: action,
				};
				break;
			case 'newFolder':
				data = {
					type: action,
					pinnables$: this.pinnables$,
					rooms: this.selectedPinnables,
				};
				break;
			case 'editRoom':
				data = {
					type: action,
					pinnable: this.pinnable,
				};
				break;
			case 'editFolder':
				data = {
					type: action,
					pinnable: this.pinnable,
					pinnables$: this.pinnables$,
					isEditFolder: true,
				};
				if (this.forceSelectedLocation) {
					data.forceSelectedLocation = this.forceSelectedLocation;
				}
				break;
			case 'edit':
				if (this.selectedPinnables.length === 1) {
					if (this.selectedPinnables[0].type === 'location') {
						data = {
							type: 'editRoom',
							pinnable: this.selectedPinnables[0],
						};
						break;
					}
					if (this.selectedPinnables[0].type === 'category') {
						data = {
							type: 'newFolder',
							pinnable: this.selectedPinnables[0],
							pinnables$: this.pinnables$,
							isEditFolder: true,
						};
						break;
					}
				} else {
					data = {
						type: action,
						rooms: this.selectedPinnables,
					};
					break;
				}
				break;
			case 'newFolderWithSelections':
				data = {
					type: 'newFolder',
					rooms: this.selectedPinnables,
				};
				break;
		}
		return this.dialogContainer(data, component);
	}

	dialogContainer(data: RoomDialogData, component): void {
		this.forceSelectedLocation = null;
		const overlayDialog = this.dialog.open(component, {
			panelClass: 'overlay-dialog-no-background',
			backdropClass: 'custom-backdrop',
			disableClose: true,
			minWidth: '800px',
			maxWidth: '100vw',
			width: '800px',
			height: '500px',
			data: data,
		});
		overlayDialog.afterClosed().subscribe((res) => {
			this.selectedPinnables = [];
			this.bulkSelect = false;
			this.pendingSubject.next(false);
		});
	}

	onboard({ createPack, pinnables }) {
		if (createPack) {
			const requests$ = pinnables.map((pin) => {
				const location = {
					title: pin.title,
					room: pin.room,
					restricted: pin.restricted,
					scheduling_restricted: pin.scheduling_restricted,
					travel_types: pin.travel_types,
					max_allowed_time: pin.max_allowed_time,
				};
				return this.locationsService.createLocation(location);
			});

			forkJoin(requests$)
				.pipe(
					switchMap((locations: Location[]) => {
						const pinnables$ = locations.map((location: Location, index) => {
							const pinnable = {
								title: pinnables[index].title,
								color_profile: pinnables[index].color_profile_id,
								icon: pinnables[index].icon,
								location: location.id,
							};
							return this.hallPassService.createPinnable(pinnable);
						});
						return forkJoin(pinnables$);
					}),
					filter(() => navigator.onLine),
					takeUntil(this.destroy$),
					switchMap((res) => {
						const order = res.map((v: any) => v.id).join(',');
						return this.hallPassService.createArrangedPinnable({ order });
					}),
					take(1),
					switchMap((res) => {
						return this.hallPassService.getPinnables();
					})
				)
				.subscribe((res: Pinnable[]) => {
					this.pinnables.push(...res);
				});
		} else {
			this.showRooms = true;
		}
		this.adminService.updateOnboardProgressRequest('2.landing:first_room');
	}

	openChat(event) {
		this.supportService.openChat(event);
	}

	closeChat(event) {
		this.supportService.closeChat(event);
	}

	dismissWaitInLineNux() {
		this.dialog.open(SchoolSettingDialogComponent, {
			data: {
				enableWil: true,
			},
			panelClass: 'overlay-dialog',
			backdropClass: 'custom-bd',
		});
		this.showWaitInLineNux.next(false);
		this.userService.updateIntrosWaitInLineRequest(this.introsData, 'universal', '1');
	}
	dismissShowRoomAsOriginNux() {
		this.showRoomAsOriginNux.next(false);
		this.userService.updateIntrosShowRoomAsOriginRequest(this.introsData, 'universal', '1');
	}
}
