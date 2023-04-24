import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, Optional } from '@angular/core';
import { HttpService } from '../services/http-service';
import { Choice, Location } from '../models/Location';
import { filter, map, pluck, switchMap, takeUntil, take, tap } from 'rxjs/operators';
import { LocationsService } from '../services/locations.service';
import { combineLatest, iif, Observable, of, Subject, zip } from 'rxjs';
import { filter as _filter, sortBy } from 'lodash';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { ScreenService } from '../services/screen.service';
import { HallPassesService } from '../services/hall-passes.service';
import { PassLimit } from '../models/PassLimit';
import { DeviceDetection } from '../device-detection.helper';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LocationVisibilityService } from '../create-hallpass-forms/main-hallpass--form/location-visibility.service';
import { UserService } from '../services/user.service';
import { User } from '../models/User';
import { PassLimitInfo } from '../models/HallPassLimits';
import { MainHallPassFormComponent } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { Pinnable } from '../models/Pinnable';

// TODO: it does wipe out any existent get set
function Visibility(): any {
	return function (target: any, property: string, descriptor: PropertyDescriptor) {
		let values: any[];

		return {
			set: function (vv: any[]) {
				// accessing mainParent component indicates that FORM_STATE should be a service
				// usually we get FORM_STATE in a cascading fashion
				// from parent to child more then 1 level deep
				const stateData = this.mainHallPassFormComponent ? this.mainHallPassFormComponent.FORM_STATE.data : null;

				const isDedicatedUser = this.forKioskMode && (!!this.user?.roles.includes('_profile_kiosk') || stateData?.kioskModeStudent instanceof User);

				// kiosk mode can be enterd in 2 ways:
				// by a teacher - isStaff
				// by a dedicated user - isDedicatedUser
				const isStaffUser = !!this.forStaff && this.forKioskMode;
				const isChooseSelectedStudent = isStaffUser || isDedicatedUser;

				// usually the real student is represented by this.user
				// but for the kiosk mode case this.user represents the account that started the kiosk mode
				// a teacher or a dedicated user
				// so we need to take the student from this.selectedStudents
				const student = [this.user];
				if (isChooseSelectedStudent) {
					student[0] = this.selectedStudents[0] ?? stateData.kioskModeStudent;
				}
				// filtering apply only for a student
				if (
					vv.length > 0 && // is student
					(!this.forStaff ||
						// is staff
						isStaffUser)
				) {
					// test if we have Location's
					let v = vv[0];
					try {
						v = v instanceof Location ? v : Location.fromJSON(v);
						vv = vv.filter((loc: Location) => this.visibilityService.filterByVisibility(loc, student));
					} catch (e) {}
				}
				values = vv;
			},
			get: function () {
				return values;
			},
			enumerable: true,
			configurable: true,
		};
	};
}

@Component({
	selector: 'app-location-table',
	templateUrl: './location-table.component.html',
	styleUrls: ['./location-table.component.scss'],
})
export class LocationTableComponent implements OnInit, OnDestroy {
	@Input() category: string;
	@Input() forKioskMode = false;
	@Input() placeholder: string;
	@Input() type: string;
	@Input() showStars: boolean;
	@Input() showFavorites: boolean;
	@Input() forStaff: boolean;
	@Input() forLater: boolean;
	@Input() hasLocks: boolean;
	@Input() invalidLocation: string | number;
	@Input() noRightStar: boolean;
	@Input() height: string = '140px';
	@Input() heightLeftTable: string = '189px';
	@Input() inputWidth: string = '200px';
	@Input() isEdit: boolean = false;
	@Input() rightHeaderText: boolean = false;
	@Input() mergedAllRooms: boolean;
	@Input() dummyString: string = '';
	@Input() withMergedStars: boolean = true;
	@Input() searchExceptFavourites: boolean = false;
	@Input() allowOnStar: boolean = false;
	@Input() isFavoriteForm: boolean;
	@Input() originLocation: Location;
	@Input() searchTeacherLocations: boolean;
	@Input() currentPage: 'from' | 'to';
	@Input() updatedLocation$?: Observable<Location> | undefined;
	@Input() selectedStudents: User[] = [];
	@Input() passLimitInfo: PassLimitInfo;

	@Output() onSelect: EventEmitter<Choice> = new EventEmitter();
	@Output() onStar: EventEmitter<Location> = new EventEmitter();
	@Output() onUpdate: EventEmitter<Location[]> = new EventEmitter<Location[]>();
	@Output() onLoaded: EventEmitter<boolean> = new EventEmitter();

	@ViewChild('item') currentItem: ElementRef;

	@Visibility()
	public choices: Choice[] = [];
	public noChoices: boolean = false;
	public mainContentVisibility: boolean = false;
	@Visibility()
	public starredChoices: Choice[] = [];
	public search: string = '';
	public favoritesLoaded: boolean;
	public hideFavorites: boolean;
	private pinnables;
	public pinnablesLoaded: boolean;

	private passLimits: PassLimit[] = [];

	private user: User;

	private showSpinner$: Observable<boolean>;
	public loaded$: Observable<boolean>;
	public loading$: Observable<boolean>;

	public isFocused: boolean;

	private destroy$: Subject<void> = new Subject<void>();

	constructor(
		private http: HttpService,
		private locationService: LocationsService,
		private pinnableService: HallPassesService,
		private shortcutsService: KeyboardShortcutsService,
		public screenService: ScreenService,
		private userService: UserService,
		private visibilityService: LocationVisibilityService,
		// used only when in context of a MainHallPassFormComponent to get access to FORM_STATE,
		// for the others cases this is null
		// this soft coupling between location and mainform component should not exists in an ideal world
		@Optional() private mainHallPassFormComponent: MainHallPassFormComponent
	) {}

	get isMobile(): boolean {
		return DeviceDetection.isMobile();
	}

	public ngOnInit(): void {
		this.userService.user$.pipe(takeUntil(this.destroy$), filter(Boolean), take(1)).subscribe((u: User) => {
			this.user = u;
		});

		const url: string =
			'v1/' +
			(this.type === 'teachers' ? 'users?role=_profile_teacher&' : 'locations?') +
			'limit=1000&' +
			(this.type === 'location' && this.showFavorites ? 'starred=false' : '');

		let request$: Observable<Location[]>;
		if (this.mergedAllRooms) {
			request$ = this.mergeLocations(url, this.withMergedStars, this.category);
		} else if (this.forKioskMode) {
			request$ = !!this.category
				? this.locationService.getLocationsFromCategory(this.category)
				: this.locationService.getLocationsWithConfigRequest(url);
		} else {
			request$ = this.isFavoriteForm
				? this.locationService.getLocationsWithConfigRequest(url).pipe(filter((res) => !!res.length))
				: this.locationService.getLocationsFromCategory(this.category).pipe(filter((res) => !!res.length));
		}

		this.pinnableService.loadedPinnables$
			.pipe(
				filter((res) => res),
				switchMap((value) => {
					return this.pinnableService.pinnables$;
				}),
				map((pins) => {
					return pins.reduce((acc, pinnable) => {
						if (pinnable.category) {
							return { ...acc, [pinnable.category]: pinnable };
						} else if (pinnable.location) {
							return { ...acc, [pinnable.location.id]: pinnable };
						}
					}, {});
				}),
				tap((pins) => {
					this.pinnables = pins;
					this.pinnablesLoaded = true;
					this.onLoaded.emit(true);
				}),
				switchMap(() => {
					return this.locationService.favoriteLocations$;
				}),
				tap((stars) => {
					const starredChoices: Location[] = stars.map((val) => Location.fromJSON(val));
					const choices: Location[] = this.filterChoicesForShowAsOrigin(starredChoices);
					this.starredChoices = this.parseLocations(choices);
					// don't filter for show as origin if this is the favorites form
					if (this.isFavoriteForm) {
						this.starredChoices = this.parseLocations(starredChoices);
						this.choices = [...this.starredChoices, ...this.choices].sort((a, b) => Number(a.id) - Number(b.id));
					}
					this.favoritesLoaded = true;
					this.mainContentVisibility = true;
				}),
				switchMap(() => {
					return request$;
				}),
				filter((res: Location[]) => !!res.length),
				tap((res: Location[]) => {
					if (this.mergedAllRooms) {
						const choices: Location[] = this.filterChoicesForShowAsOrigin(res);
						this.choices = this.parseLocations(choices);
					} else {
						const filteredChoices: Location[] = this.filterChoicesForPassLimit(res);
						if (this.currentPage === 'from') {
							const choices: Location[] = this.filterChoicesForShowAsOrigin(filteredChoices);
							this.choices = this.parseLocations(choices);
						} else {
							this.choices = this.parseLocations(filteredChoices);
						}
					}
					this.noChoices = !this.choices.length;
					this.mainContentVisibility = true;
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();

		this.showSpinner$ = combineLatest(
			this.locationService.loadingLocations$,
			this.locationService.loadingFavoriteLocations$,
			(loc, fav) => loc && fav
		);
		this.loaded$ = combineLatest(this.locationService.loadedLocations$, this.locationService.loadedFavoriteLocations$, (loc, fav) => loc && fav);

		this.loaded$.subscribe({ next: (isLoaded) => this.onLoaded.emit(isLoaded) });

		this.loading$ = this.locationService.loadingLocations$;

		if (!this.locationService.focused.value) {
			this.locationService.focused.next(true);
		}

		this.locationService.pass_limits_entities$
			.pipe(
				filter((passLimits) => !this.isFavoriteForm && !!Object.keys(passLimits)),
				takeUntil(this.destroy$)
			)
			.subscribe((passLimits) => {
				this.passLimits = Object.values(passLimits);
			});

		this.isFocused = !this.isFavoriteForm && !DeviceDetection.isMobile();

		this.shortcutsService.onPressKeyEvent$
			.pipe(
				filter(() => this.isMobile),
				pluck('key'),
				takeUntil(this.destroy$)
			)
			.subscribe((key) => {
				if (key[0] === 'enter') {
					if (this.choices.length === 1) {
						const wrap = this.currentItem.nativeElement.querySelector('.wrapper');
						(wrap as HTMLElement).click();
					}
					const element = document.activeElement;
					(element as HTMLElement).click();
				}
			});

		// this observable is triggered whenever a location is modified by an admin or teacher
		this.updatedLocation$
			?.pipe(
				tap((res: Location) => {
					let loc: Location = res;
					if (!(res instanceof Location)) {
						loc = Location.fromJSON(res);
					}
					const choice = this.parseLocations([loc]);
					this.updateOrAddChoices(choice[0]);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private filterChoicesForPassLimit(choices: Location[]): Location[] {
		return choices.map((loc) => {
			let pinnable: Pinnable;
			if (this.pinnables && this.pinnables[loc.id]) {
				pinnable = this.pinnables[loc.id];
			} else if (this.pinnables && this.pinnables[loc.category]) {
				pinnable = this.pinnables[loc.category];
			}

			const ignoreStudentsPassLimit = pinnable?.ignore_students_pass_limit ?? false;

			loc.restricted = loc.restricted || (this.passLimitInfo?.current === 0 && !ignoreStudentsPassLimit);
			return loc;
		});
	}

	private filterChoicesForShowAsOrigin(choices: Location[]): Location[] {
		return choices.filter((loc) => {
			if (this.pinnables && this.pinnables[loc.id]) {
				const pinnable = this.pinnables[loc.id];
				if (pinnable.show_as_origin_room) {
					return loc;
				}
			}
			// choice with a category is within a pinnable folder
			else if (loc.category !== null) {
				const pinnable = this.pinnables[loc.category];
				if (pinnable.show_as_origin_room) {
					return loc;
				}
			}
		});
	}

	private parseLocations(choices: Location[]): Choice[] {
		return choices.map((choice: Location) => {
			const choiceData: Partial<Choice> = {
				id: choice.id,
				passLimit: this.getPassLimit(choice),
				disabledToolTip: this.getDisabledTooltip(choice),
				isValidLocation: this.isValidLocation(choice.id),
				normalizedLocation: this.normalizeLocations(choice),
				roomIsHidden: this.checkRoomIsHidden(choice),
				isSelected: this.isSelected(choice),
			};
			return Object.assign(choiceData, choice) as Choice;
		});
	}

	private updateOrAddChoices(choice: Choice): void {
		const choiceIndex: number = this.choices.findIndex((c) => c.id.toString() === choice.id.toString());
		if (choiceIndex !== -1) {
			this.choices[choiceIndex] = choice;
		} else {
			this.choices.push(choice);
		}

		if (!choice.starred) {
			return;
		}
		const starredChoiceIndex: number = this.choices.findIndex((c) => c.id.toString() === choice.id.toString());
		if (starredChoiceIndex !== -1) {
			this.starredChoices[starredChoiceIndex] = choice;
		} else {
			this.starredChoices.push(choice);
		}
	}

	public normalizeLocations(loc: Location): Location {
		if (this.pinnables && this.currentPage !== 'from' && !this.isFavoriteForm) {
			if (loc.category) {
				if (!this.pinnables[loc.category] || !this.pinnables[loc.category].gradient_color) {
					loc.gradient = '#7f879d, #7f879d';
				} else {
					loc.gradient = this.pinnables[loc.category].gradient_color;
				}
			} else {
				if (!this.pinnables[loc.id] || !this.pinnables[loc.id].gradient_color) {
					loc.gradient = '#7f879d, #7f879d';
				} else {
					loc.gradient = this.pinnables[loc.id].gradient_color;
				}
			}
		}

		return loc;
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public updateOrderLocation(event: CdkDragDrop<string[]>): void {
		moveItemInArray(this.starredChoices, event.previousIndex, event.currentIndex);
		this.onUpdate.emit(this.starredChoices);
	}

	public onSearch(search: string): void {
		this.search = search.toLowerCase();
		if (search !== '') {
			const url =
				'v1/' +
				(this.type === 'teachers' ? 'users?role=_profile_teacher&' : 'locations' + (!!this.category ? '?category=' + this.category + '&' : '?')) +
				'limit=100' +
				'&search=' +
				search +
				(this.type === 'location' && this.showFavorites ? '&starred=false' : '');

			this.locationService
				.searchLocationsRequest(url)
				.pipe(
					takeUntil(this.destroy$),
					switchMap((locs) => {
						if (this.searchTeacherLocations) {
							return this.locationService.locations$.pipe(
								map((locations) => {
									const teachersRoom = locations.filter((location: Location) => {
										return (location.teachers as User[]).find((teacher) => teacher.display_name.toLowerCase().includes(this.search));
									});

									// deduplicate rooms when searching
									const locMap: { [id: string]: Location } = {};
									const outLocations: Location[] = [];
									for (const obj of [...locs, ...teachersRoom]) {
										if (typeof locMap[obj.id] === 'undefined') {
											outLocations.push(obj);
										}
										locMap[obj.id] = obj;
									}

									return outLocations;
								})
							);
						}
						return of(locs);
					})
				)
				.subscribe((p) => {
					const parsedLocations: Choice[] = this.parseLocations(p);
					this.hideFavorites = true;
					const filtFevLoc = _filter(this.starredChoices, (item) => {
						return item.title.toLowerCase().includes(this.search);
					});
					this.choices = (
						(this.searchExceptFavourites && !this.forKioskMode) || !!this.category
							? [...this.filterResults(parsedLocations)]
							: [...filtFevLoc, ...this.filterResults(parsedLocations)]
					).filter((r) => {
						if (this.category) {
							return this.category === r.category;
						}
						return r;
					});
					this.noChoices = !this.choices.length;
				});
		} else {
			iif(() => !!this.category, this.locationService.locsFromCategory$, this.locationService.locations$)
				.pipe(takeUntil(this.destroy$))
				.subscribe((res: Location[]) => {
					const choices: Location[] = res.filter((r) => {
						if (this.category) {
							return r.category === this.category;
						}
						return r;
					});
					this.choices = this.parseLocations(choices);
					this.hideFavorites = false;
					this.noChoices = !this.choices.length;
				});
		}
	}

	private isValidLocation(locationId: number): boolean {
		if (this.isFavoriteForm) return true;
		else if (+locationId === +this.invalidLocation) return false;
		else if (this.forStaff && !this.forKioskMode) return true;

		const location = this.passLimits.find((pl) => pl.id === locationId);
		if (!location) return false;

		// return this.tooltipService.reachedPassLimit(this.currentPage, location);
		return true;
	}

	private mergeLocations(url: string, withStars: boolean, category: string): Observable<Location[]> {
		const locsRequest$ = !!category
			? this.locationService.getLocationsFromCategory(category)
			: this.locationService.getLocationsWithConfigRequest(url);
		return zip(locsRequest$, this.locationService.getFavoriteLocationsRequest()).pipe(
			takeUntil(this.destroy$),
			map(([rooms, favorites]: [Location[], Location[]]) => {
				if (withStars) {
					const locs: Location[] = sortBy([...rooms, ...favorites], (item) => {
						return item.title.toLowerCase();
					});
					return locs;
				} else {
					return rooms;
				}
			})
		);
	}

	private filterResults(results: Choice[]): Choice[] {
		return results.filter((felement) => {
			return (
				this.starredChoices.findIndex((ielement) => {
					return ielement.id === felement.id;
				}) < 0
			);
		});
	}

	public choiceSelected(choice: Choice): void {
		const passLimit = this.passLimits.find((pl) => pl.id === choice.id);
		if (passLimit) {
			choice['numberOfStudentsInRoom'] = passLimit.to_count;
		}
		this.locationService.focused.next(false);
		this.onSelect.emit(choice);
	}

	private checkRoomIsHidden(loc: Location): boolean {
		if (this.forKioskMode) {
			return this.isValidLocation(loc.id);
		}
		return true;
	}

	private isSelected(loc: Location): boolean {
		return !!this.starredChoices.find((item) => item.id === loc.id);
	}

	public star(event: Choice): void {
		if (!this.isEdit) {
			return this.choiceSelected(event);
		}
		if (event.starred) {
			this.addLoc(event, this.starredChoices);
		} else {
			this.removeLoc(event, this.starredChoices);
		}
		this.onSearch('');
		this.onStar.emit(event as Location);
		this.search = '';
	}

	private addLoc(choice: Choice, array: Location[]): void {
		if (!array.includes(choice)) {
			array.push(choice);
		}
	}

	private removeLoc(loc: Choice, array: Choice[]): void {
		const index = array.findIndex((element) => element.id === loc.id);
		if (index > -1) {
			array.splice(index, 1);
		}
	}

	private getDisabledTooltip(loc: Location): boolean {
		return this.originLocation && this.originLocation.id === loc.id;
	}

	private getPassLimit(loc: Location): PassLimit {
		return this.passLimits ? this.passLimits.find((pl) => pl.id === loc.id) : null;
	}
}
