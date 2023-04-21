import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

import { BehaviorSubject, combineLatest, forkJoin, fromEvent, merge, Observable, of, Subject, zip } from 'rxjs';
import { catchError, concatMap, debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { bumpIn, NextStep } from '../../animations';
import { Pinnable } from '../../models/Pinnable';
import { Location } from '../../models/Location';
import { HttpService } from '../../services/http-service';
import { UserService } from '../../services/user.service';
import { HallPassesService } from '../../services/hall-passes.service';
import { LocationsService } from '../../services/locations.service';
import { OptionState, ValidButtons } from './advanced-options/advanced-options.component';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import {
	BulkEditDataResult,
	FolderData,
	FolderDataResult,
	OverlayDataService,
	OverlayPages,
	RoomData,
	RoomDataResult,
	RoomInFolder,
} from './overlay-data.service';
import { cloneDeep, differenceBy, filter as _filter, isString, pullAll } from 'lodash';
import { ColorProfile } from '../../models/ColorProfile';
import { User } from '../../models/User';
import { ToastService } from '../../services/toast.service';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { DEFAULT_VISIBILITY_STUDENTS, VisibilityOverStudents } from './visibility-room/visibility-room.type';
import { BlockScrollService } from './block-scroll.service';
import { Icon } from '../icon-picker/icon-picker.component';
import { IntroData } from '../../ngrx/intros';

export interface RoomDialogData {
	type: string;
	pinnables$?: Observable<Pinnable[]>;
	pinnable?: Pinnable;
	rooms?: Pinnable[];
	isEditFolder?: boolean;
	forceSelectedLocation?: Location;
}
interface UniqueRoomName {
	room_name: boolean;
}

interface UniqueFiolderName {
	folder_name: boolean;
}

@Component({
	selector: 'app-overlay-container',
	templateUrl: './overlay-container.component.html',
	styleUrls: ['./overlay-container.component.scss'],
	animations: [NextStep, bumpIn],
	providers: [BlockScrollService],
})
export class OverlayContainerComponent implements OnInit, OnDestroy {
	@ViewChild('block', { static: true }) block: ElementRef;

	public currentPage: OverlayPages;
	public PagesEnum = OverlayPages; // for use in template
	public roomData: RoomData;
	public folderData: FolderData;

	private oldFolderData: FolderData;

	private bulkEditData: {
		roomData: RoomData;
		rooms: RoomInFolder[];
		pinnables: Pinnable[];
	};

	private initialSettings = {
		icon: 'https://cdn.smartpass.app/icons8/radish/FFFFFF',
		color: null,
		ignoreStudentsPassLimit: null,
		showRoomAsOrigin: null,
	};

	private roomValidButtons = new BehaviorSubject<ValidButtons>({
		publish: false,
		incomplete: false,
		cancel: false,
	});

	public selectedRooms: Pinnable[] = [];
	private pinnable: Pinnable;
	public pinnables: Pinnable[];
	private overlayType: string;
	public gradientColor: string;

	public color_profile: ColorProfile;
	public selectedIcon: Icon | string;

	private pinnablesCollectionIds$: Observable<number[] | string[]>;

	public icons$: Observable<Icon[]>;

	public titleIcon: string;
	private isDirtyColor: boolean;
	private isDirtyIcon: boolean;
	private isDirtyIgnoreStudentsPassLimit: boolean;

	private folderRoomsLoaded: boolean;

	private pinnableToDeleteIds: number[] = [];

	public titleColor: string = 'white';

	public form: FormGroup;
	public passLimitForm: FormGroup;
	public enableRoomTrigger: Subject<boolean> = new Subject<boolean>();
	public isOpenRoom: boolean;
	public showErrors: boolean;

	public visibilityForm: FormGroup;
	private visibility: VisibilityOverStudents = DEFAULT_VISIBILITY_STUDENTS;

	public showPublishSpinner: boolean;
	public iconTextResult$: Subject<string> = new Subject<string>();
	public showBottomShadow: boolean = true;

	private advOptState: OptionState = {
		now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
		future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
		needsCheckIn: false,
	};

	private introsData: IntroData;
	public showNuxTooltip: Subject<boolean> = new Subject<boolean>();

	private destroy$: Subject<void> = new Subject<void>();

	constructor(
		@Inject(MAT_DIALOG_DATA) public dialogData: RoomDialogData,
		private dialogRef: MatDialogRef<OverlayContainerComponent>,
		private userService: UserService,
		private http: HttpService,
		private locationService: LocationsService,
		private hallPassService: HallPassesService,
		private formService: CreateFormService,
		public sanitizer: DomSanitizer,
		public overlayService: OverlayDataService,
		private toast: ToastService,
		private dialog: MatDialog,
		private blockScrollService: BlockScrollService
	) {}

	get roomTitle(): string {
		if (this.currentPage === OverlayPages.NewRoom || this.currentPage === OverlayPages.EditRoom) {
			return this.roomData ? this.roomData.roomName : null;
		} else {
			if (this.currentPage === OverlayPages.BulkEditRooms) {
				return 'Bulk Edit Rooms';
			} else {
				return this.folderData ? this.folderData.folderName : null;
			}
		}
	}

	get disabledRightBlock(): boolean {
		return (
			this.currentPage === OverlayPages.NewRoomInFolder ||
			this.currentPage === OverlayPages.EditRoomInFolder ||
			this.currentPage === OverlayPages.ImportRooms ||
			this.currentPage === OverlayPages.BulkEditRoomsInFolder ||
			this.currentPage === OverlayPages.AddExistingRooms
		);
	}

	// how to use: change it and revert it back to FALSE after you finish
	public isSaveButtonDisabled: boolean = false;

	get isFormIncomplete(): boolean {
		if (
			this.currentPage === OverlayPages.NewRoom ||
			this.currentPage === OverlayPages.EditRoom ||
			this.currentPage === OverlayPages.NewFolder ||
			this.currentPage === OverlayPages.EditFolder
		) {
			if (this.isDirtyColor || this.isDirtyIcon || this.isDirtyIgnoreStudentsPassLimit) {
				if (this.currentPage === OverlayPages.NewRoom || this.currentPage === OverlayPages.EditRoom) {
					return !this.isValidRoomForm;
				}
				if (this.currentPage === OverlayPages.EditFolder) {
					return !this.form.get('folderName').valid;
				}
				return false;
			}
			if (!this.selectedIcon || !this.color_profile) {
				return true;
			}
		}

		if (
			(this.currentPage === OverlayPages.EditRoom || this.currentPage === OverlayPages.NewRoom || this.currentPage === OverlayPages.BulkEditRooms) &&
			this.roomData !== undefined
		) {
			if (
				(this.roomData.advOptState.now.state === 'Certain \n teachers' && this.roomData.advOptState.now.data.selectedTeachers.length === 0) ||
				(this.roomData.advOptState.future.state === 'Certain \n teachers' && this.roomData.advOptState.future.data.selectedTeachers.length === 0)
			) {
				return true;
			}
		}

		if (this.visibilityForm.invalid) {
			return true;
		}

		return !this.roomValidButtons.getValue().publish;
	}

	get isAllowedSave(): boolean {
		return (
			this.currentPage === OverlayPages.NewRoom ||
			this.currentPage === OverlayPages.EditRoom ||
			this.currentPage === OverlayPages.NewFolder ||
			this.currentPage === OverlayPages.EditFolder ||
			this.currentPage === OverlayPages.BulkEditRooms
		);
	}

	get saveButtonToolTip(): string | null {
		if (this.isFormIncomplete) {
			let missing = [];

			if (this.currentPage === OverlayPages.EditRoom || this.currentPage === OverlayPages.NewRoom) {
				if (this.form.get('roomName').invalid) {
					missing.push('room name');
				}
			}
			if (
				this.currentPage === OverlayPages.NewFolder ||
				this.currentPage === OverlayPages.EditFolder ||
				this.currentPage === OverlayPages.BulkEditRoomsInFolder
			) {
				if (this.form.get('folderName').invalid) {
					missing.push('folder name');
				}
			}

			if (
				this.currentPage === OverlayPages.EditRoom ||
				this.currentPage === OverlayPages.NewRoom ||
				this.currentPage === OverlayPages.NewFolder ||
				this.currentPage === OverlayPages.EditFolder ||
				this.currentPage === OverlayPages.BulkEditRoomsInFolder
			) {
				if (!this.selectedIcon) {
					missing.push('icon');
				}
				if (!this.color_profile) {
					missing.push('color');
				}
			}

			if (this.currentPage === OverlayPages.EditRoom || this.currentPage === OverlayPages.NewRoom) {
				if (this.form.get('roomNumber').invalid) {
					missing.push('room number');
				}
				if (this.form.get('timeLimit').invalid) {
					missing.push('time limit');
				}

				if (this.roomData !== undefined) {
					if (this.roomData.travelType.length === 0) {
						missing.push('travel type');
					}
					if (this.roomData.advOptState.now.state === 'Certain \n teachers' && this.roomData.advOptState.now.data.selectedTeachers.length === 0) {
						missing.push('restriction for now teachers');
					}
					if (
						this.roomData.advOptState.future.state === 'Certain \n teachers' &&
						this.roomData.advOptState.future.data.selectedTeachers.length === 0
					) {
						missing.push('restriction for future teachers');
					}
				}
				if (this.passLimitForm.get('to').invalid && this.passLimitForm.get('toEnabled').value) {
					missing.push('active pass limit');
				}
				if (this.visibilityForm.invalid) {
					missing.push('room visibility');
				}
			}

			if (this.currentPage === OverlayPages.BulkEditRooms) {
				if (this.bulkEditData !== undefined && this.bulkEditData.roomData !== undefined) {
					if (
						this.bulkEditData.roomData.advOptState.now.state === 'Certain \n teachers' &&
						this.bulkEditData.roomData.advOptState.now.data.selectedTeachers.length === 0
					) {
						missing.push('restriction for now teachers');
					}
					if (
						this.bulkEditData.roomData.advOptState.future.state === 'Certain \n teachers' &&
						this.bulkEditData.roomData.advOptState.future.data.selectedTeachers.length === 0
					) {
						missing.push('restriction for future teachers');
					}
				}
				if (this.passLimitForm.get('to').invalid && this.passLimitForm.get('toEnabled').value) {
					missing.push('pass limit');
				}
			}

			if (missing.length === 1) {
				return 'Missing ' + missing[0];
			}
			if (missing.length === 2) {
				return `Missing ${missing[0]} and ${missing[1]}`;
			}
			if (missing.length !== 0) {
				return `Missing ${missing.slice(0, missing.length - 1).join(', ')}, and ${missing[missing.length - 1]}`;
			}
		}

		if (this.showPublishSpinner) {
			return 'Please wait, rooms are still being uploaded.';
		}

		return null;
	}

	get isValidRoomForm(): boolean {
		return this.form.get('roomName').valid && this.form.get('roomNumber').valid && this.form.get('timeLimit').valid;
	}

	get showIncompleteButton(): boolean {
		// if (this.currentPage === OverlayPages.BulkEditRooms) {
		//   return this.roomValidButtons.getValue().incomplete;
		// } else {
		//   return (this.roomValidButtons.getValue().incomplete ||
		//     !this.selectedIcon || !this.color_profile) && this.showCancelButton;
		// }
		return false;
	}

	get showCancelButton(): boolean {
		return (
			(this.roomValidButtons.getValue().cancel || this.isDirtyIcon || this.isDirtyColor || this.isDirtyIgnoreStudentsPassLimit) &&
			!this.disabledRightBlock
		);
	}

	public ngOnInit(): void {
		this.pinnablesCollectionIds$ = this.hallPassService.pinnablesCollectionIds$;
		this.overlayService.pageState.pipe(filter((res) => !!res)).subscribe((res) => {
			this.currentPage = res.currentPage;
		});
		this.overlayType = this.dialogData.type;
		if (this.dialogData.pinnable) {
			this.pinnable = this.dialogData.pinnable;
			// initial visibility
			this.visibility = this.getVisibilityStudents(this.pinnable.location);
		}
		if (this.dialogData.rooms) {
			this.pinnableToDeleteIds = this.dialogData.rooms.map((pin) => +pin.id);
			this.selectedRooms = this.dialogData.rooms;
		}

		if (this.dialogData.forceSelectedLocation) {
			this.setToEditRoom(this.dialogData.forceSelectedLocation);
		}

		if (this.dialogData.pinnables$) {
			this.dialogData.pinnables$
				.pipe(
					map((pinnables) => {
						const filterLocations: Pinnable[] = _filter<Pinnable>(pinnables as Pinnable[], { type: 'location' });
						const locationsIds: number[] = filterLocations.map((item) => item.location.id);
						const currentLocationsIds: number[] = this.selectedRooms.map((room) => {
							if (room.type && room.type === 'location') {
								return room.location.id;
							}
							if (!room.type) {
								return room.id;
							}
						});
						return filterLocations.filter((item) => {
							return item.location.id === pullAll(locationsIds, currentLocationsIds).find((id) => item.location.id === id);
						});
					}),
					tap((pinnables: Pinnable[]) => {
						this.pinnables = pinnables;
					})
				)
				.subscribe(() => {
					this.buildForm();
				});
		} else {
			this.buildForm();
		}

		this.getHeaderData();

		this.visibilityForm.valueChanges
			.pipe(
				filter((v: { visibility: VisibilityOverStudents | null }) => {
					return !!v?.visibility;
				}),
				map(({ visibility: v }: { visibility: VisibilityOverStudents }): VisibilityOverStudents => v)
			)
			.subscribe((v: VisibilityOverStudents) => {
				this.visibility = cloneDeep(v);
			});

		if (
			this.currentPage === OverlayPages.EditFolder ||
			this.currentPage === OverlayPages.EditRoom ||
			this.currentPage === OverlayPages.EditRoomInFolder
		) {
			this.icons$ = merge(this.form.get('roomName').valueChanges, this.form.get('folderName').valueChanges).pipe(
				debounceTime(300),
				distinctUntilChanged(),
				filter((search) => search),
				switchMap((search) => {
					return this.http.searchIcons(search.toLowerCase()) as Observable<Icon[]>;
				})
			);
		} else {
			this.icons$ = merge(this.overlayService.roomNameBlur$, this.overlayService.folderNameBlur$).pipe(
				filter((value) => !!value),
				switchMap((value: string) => {
					return this.http.searchIcons(value.toLowerCase()).pipe(
						tap((res: any[]) => {
							if (!res) {
								this.iconTextResult$.next('No results');
							}
						})
					);
				})
			);
		}
		// TODO: strabge bug here!!!
		// id backdrop is clicked once then it receives the clicks's components inside overlay-container
		// left here commented to indicate this elusive bug
		// as it is unclear why it happens
		/*this.dialogRef.backdropClick()
      .pipe(
        switchMap(() => {
          return this.roomValidButtons;
        }),
        filter((rvb: ValidButtons): boolean => {
          return Object.values(rvb).every(v => !v);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
      this.dialogRef.close();
    });*/
		/*this.dialogRef.backdropClick()
      .pipe(
        switchMap(() => {
          return this.roomValidButtons;
        }),
        filter((rvb: ValidButtons): boolean => {
          return Object.values(rvb).every(v => !v);
        }),
        tap(_ => this.dialogRef.close()),
        takeUntil(this.destroy$),
      )
      .subscribe();*/

		fromEvent(this.block.nativeElement, 'scroll')
			.pipe(takeUntil(this.destroy$))
			.subscribe((res: any) => {
				if (res.target.offsetHeight + res.target.scrollTop >= res.target.scrollHeight) {
					this.showBottomShadow = false;
				} else {
					this.showBottomShadow = true;
				}

				this.blockScrollService.doesScrolling();
			});

		combineLatest(
			this.userService.introsData$.pipe(filter((res) => !!res)),
			this.userService.nuxDates$.pipe(filter((r) => !!r)),
			this.userService.user$.pipe(filter((r) => !!r))
		)
			.pipe(debounceTime(1000), takeUntil(this.destroy$))
			.subscribe({
				next: ([intros, nuxDates, user]) => {
					this.introsData = intros;
					// const showNux = moment(user.first_login).isBefore(moment(nuxDates[2].created), 'day');
					this.showNuxTooltip.next(!this.introsData.disable_room_reminder.universal.seen_version);
				},
			});
	}

	private getHeaderData(): void {
		let colors: string;
		switch (this.overlayType) {
			case 'newRoom':
				this.overlayService.changePage(OverlayPages.NewRoom, null, null);
				this.titleColor = '#1F195E';
				break;
			case 'editFolder':
			case 'newFolder':
				if (!!this.pinnable) {
					colors = this.pinnable.color_profile.gradient_color;
					this.overlayService.changePage(OverlayPages.EditFolder, null, {
						pinnable: this.pinnable,
					});
					this.color_profile = this.pinnable.color_profile;
					this.selectedIcon = this.pinnable.icon;
					this.titleIcon = this.pinnable.icon;
					this.initialSettings = {
						icon: cloneDeep(this.selectedIcon),
						color: cloneDeep(this.color_profile),
						ignoreStudentsPassLimit: this.pinnable.ignore_students_pass_limit,
						showRoomAsOrigin: this.pinnable.show_as_origin_room,
					};
					break;
				}
				this.overlayService.changePage(OverlayPages.NewFolder, null, null);
				this.titleColor = '#1F195E';
				this.folderRoomsLoaded = true;
				break;
			case 'editRoom':
				this.overlayService.changePage(OverlayPages.EditRoom, null, {
					pinnable: this.pinnable,
					advancedOptions: this.generateAdvOptionsModel(this.pinnable.location),
					visibility: this.getVisibilityStudents(this.pinnable.location),
				});
				colors = this.pinnable.color_profile.gradient_color;
				this.selectedIcon = this.pinnable.icon;
				this.titleIcon = this.pinnable.icon;
				this.color_profile = this.pinnable.color_profile;
				this.initialSettings = {
					icon: cloneDeep(this.selectedIcon),
					color: cloneDeep(this.color_profile),
					ignoreStudentsPassLimit: this.pinnable.ignore_students_pass_limit,
					showRoomAsOrigin: this.pinnable.show_as_origin_room,
				};
				break;
			case 'edit':
				this.overlayService.changePage(OverlayPages.BulkEditRooms, null, null);
				this.titleColor = '#1F195E';
				break;
		}
		this.currentPage = this.overlayService.pageState.getValue().currentPage;
		this.gradientColor = 'radial-gradient(circle at 98% 97%,' + (colors || ' #FFFFFF, #FFFFFF') + ')';
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		const afresh = { visibility: DEFAULT_VISIBILITY_STUDENTS };
		this.overlayService.patchData(afresh);
	}

	private buildForm(): void {
		let countsTowardsPassLimits: boolean = true;
		let showAsOriginRoom: boolean = true;
		if (!!this.pinnable) {
			countsTowardsPassLimits = !this.pinnable.ignore_students_pass_limit;
			showAsOriginRoom = this.pinnable.show_as_origin_room;
		}

		this.form = new FormGroup({
			file: new FormControl(),
			roomName: new FormControl('', [Validators.maxLength(15)], this.uniqueRoomNameValidator.bind(this)),
			folderName: new FormControl('', [Validators.maxLength(17)], this.uniqueFolderNameValidator.bind(this)),
			roomNumber: new FormControl('', [Validators.required, Validators.maxLength(7)]),
			timeLimit: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*?[0-9]+$'), Validators.min(1), Validators.max(999)]),
			countsTowardsPassLimits: new FormControl(countsTowardsPassLimits),
			showAsOriginRoom: new FormControl(showAsOriginRoom),
		});

		this.passLimitForm = new FormGroup({
			fromEnabled: new FormControl(this.pinnable && this.pinnable.location ? this.pinnable.location.max_passes_from_active : false),
			from: new FormControl(this.pinnable && this.pinnable.location ? '' + this.pinnable.location.max_passes_from : '', [
				Validators.required,
				Validators.pattern('^[0-9]*?[0-9]+$'),
			]),
			toEnabled: new FormControl(this.pinnable && this.pinnable.location ? this.pinnable.location.max_passes_to_active : false),
			to: new FormControl(this.pinnable && this.pinnable.location ? '' + this.pinnable.location.max_passes_to : '', [
				Validators.required,
				Validators.pattern('^[0-9]*?[0-9]+$'),
			]),
		});

		this.visibilityForm = new FormGroup({
			visibility: new FormControl(
				this.visibility,
				// TODO: move validator to its own file
				[
					(c: AbstractControl): ValidationErrors | null => {
						// abort, skip, abanton do not engage validation
						if (c.value === null) {
							return null;
						}
						// only visible_all_students do not need a group of students
						// ensures non-all modes have a non-empty over array (students)
						if (c.value.mode !== 'visible_all_students' && c.value.over.length === 0 && c.value.grade.length === 0) {
							return { needover: 'you must select at least 1 student or a grade.' };
						}
						return null;
					},
				]
			),
		});
	}

	private getVisibilityStudents(loc: Location): VisibilityOverStudents {
		if (!loc) {
			return cloneDeep(DEFAULT_VISIBILITY_STUDENTS);
		}
		return {
			...cloneDeep(DEFAULT_VISIBILITY_STUDENTS),
			mode: loc.visibility_type,
			over: loc.visibility_students as User[],
			grade: loc.visibility_grade,
		};
	}

	private generateAdvOptionsModel(loc: Location): OptionState {
		if (loc.request_mode === 'teacher_in_room' || loc.request_mode === 'all_teachers_in_room') {
			const mode = loc.request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

			if (loc.request_send_destination_teachers && loc.request_send_origin_teachers) {
				this.advOptState.now.data[mode] = 'Both';
			} else if (loc.request_send_destination_teachers) {
				this.advOptState.now.data[mode] = 'This Room';
			} else if (loc.request_send_origin_teachers) {
				this.advOptState.now.data[mode] = 'Origin';
			}
		} else if (loc.request_mode === 'specific_teachers') {
			this.advOptState.now.data.selectedTeachers = loc.request_teachers as User[];
		}
		if (loc.scheduling_request_mode === 'teacher_in_room' || loc.scheduling_request_mode === 'all_teachers_in_room') {
			const mode = loc.scheduling_request_mode === 'teacher_in_room' ? 'any_teach_assign' : 'all_teach_assign';

			if (loc.scheduling_request_send_destination_teachers && loc.scheduling_request_send_origin_teachers) {
				this.advOptState.future.data[mode] = 'Both';
			} else if (loc.scheduling_request_send_destination_teachers) {
				this.advOptState.future.data[mode] = 'This Room';
			} else if (loc.scheduling_request_send_origin_teachers) {
				this.advOptState.future.data[mode] = 'Origin';
			}
		} else if (loc.scheduling_request_mode === 'specific_teachers') {
			this.advOptState.future.data.selectedTeachers = loc.scheduling_request_teachers as User[];
		}

		if (loc.request_mode === 'any_teacher') {
			this.advOptState.now.state = 'Any teacher';
		} else if (loc.request_mode === 'teacher_in_room') {
			this.advOptState.now.state = 'Any teachers in room';
		} else if (loc.request_mode === 'all_teachers_in_room') {
			this.advOptState.now.state = 'All teachers in room';
		} else if (loc.request_mode === 'specific_teachers') {
			this.advOptState.now.state = 'Certain \n teachers';
		}
		if (loc.scheduling_request_mode === 'any_teacher') {
			this.advOptState.future.state = 'Any teacher';
		} else if (loc.scheduling_request_mode === 'teacher_in_room') {
			this.advOptState.future.state = 'Any teachers in room';
		} else if (loc.scheduling_request_mode === 'all_teachers_in_room') {
			this.advOptState.future.state = 'All teachers in room';
		} else if (loc.scheduling_request_mode === 'specific_teachers') {
			this.advOptState.future.state = 'Certain \n teachers';
		}
		return this.advOptState;
	}

	private uniqueRoomNameValidator(control: AbstractControl): Observable<UniqueRoomName> {
		if (control.dirty) {
			return this.locationService.checkLocationName(control.value).pipe(
				filter(() => this.currentPage !== OverlayPages.NewFolder && this.currentPage !== OverlayPages.EditFolder),
				map((res: any) => {
					if (this.currentPage === OverlayPages.NewRoom || this.currentPage === OverlayPages.NewRoomInFolder) {
						return res.title_used ? { room_name: true } : null;
					} else {
						let currentRoomName: string = this.overlayService.pageState.getValue()?.data?.selectedRoomsInFolder[0]?.title;
						if (!currentRoomName) {
							currentRoomName = this.pinnable.location.title;
						}
						return res.title_used && currentRoomName !== this.roomData.roomName ? { room_name: true } : null;
					}
				})
			);
		} else {
			return of(null);
		}
	}

	private uniqueFolderNameValidator(control: AbstractControl): Observable<UniqueFiolderName> {
		if (control.dirty) {
			return this.hallPassService.checkPinnableName(control.value).pipe(
				map((res: any) => {
					if (this.currentPage === OverlayPages.NewFolder) {
						return res.title_used ? { folder_name: true } : null;
					}
					return res.title_used && this.pinnable.title !== this.folderData.folderName ? { folder_name: true } : null;
				})
			);
		} else {
			return of(null);
		}
	}

	public changeColor(color: ColorProfile): void {
		if (this.currentPage === OverlayPages.EditRoom || this.currentPage === OverlayPages.EditFolder) {
			this.isDirtyColor = this.initialSettings.color.id !== color.id;
		}
		this.color_profile = color;
		this.titleColor = 'white';
		this.gradientColor = 'radial-gradient(circle at 98% 97%,' + color.gradient_color + ')';
	}

	public changeIcon(icon: Icon): void {
		if (this.currentPage === OverlayPages.EditRoom || this.currentPage === OverlayPages.EditFolder) {
			this.isDirtyIcon = this.initialSettings.icon !== icon.inactive_icon;
		}
		this.selectedIcon = icon;
		this.titleIcon = icon.inactive_icon;
	}

	public changeIgnoreStudentsPassLimit(value): void {
		if (this.currentPage === OverlayPages.EditFolder) {
			this.isDirtyIgnoreStudentsPassLimit = this.initialSettings.ignoreStudentsPassLimit !== value;
			console.log(this.isDirtyIgnoreStudentsPassLimit);
		}
	}

	private normalizeAdvOptData(roomData: RoomData = this.roomData): OptionState {
		const data: any = {};
		if (roomData.advOptState.now.state === 'Any teacher') {
			data.request_mode = 'any_teacher';
			data.request_send_origin_teachers = true;
			data.request_send_destination_teachers = true;
		} else if (roomData.advOptState.now.state === 'Any teachers in room') {
			data.request_mode = 'teacher_in_room';
		} else if (roomData.advOptState.now.state === 'All teachers in room') {
			data.request_mode = 'all_teachers_in_room';
		} else if (roomData.advOptState.now.state === 'Certain \n teachers') {
			data.request_mode = 'specific_teachers';
		}
		if (roomData.advOptState.future.state === 'Any teacher') {
			data.scheduling_request_mode = 'any_teacher';
			data.scheduling_request_send_origin_teachers = true;
			data.scheduling_request_send_destination_teachers = true;
		} else if (roomData.advOptState.future.state === 'Any teachers in room') {
			data.scheduling_request_mode = 'teacher_in_room';
		} else if (roomData.advOptState.future.state === 'All teachers in room') {
			data.scheduling_request_mode = 'all_teachers_in_room';
		} else if (roomData.advOptState.future.state === 'Certain \n teachers') {
			data.scheduling_request_mode = 'specific_teachers';
		}
		if (roomData.advOptState.now.data.any_teach_assign === 'Both' || roomData.advOptState.now.data.all_teach_assign === 'Both') {
			data.request_send_origin_teachers = true;
			data.request_send_destination_teachers = true;
		} else if (roomData.advOptState.now.data.any_teach_assign === 'Origin' || roomData.advOptState.now.data.all_teach_assign === 'Origin') {
			data.request_send_origin_teachers = true;
			data.request_send_destination_teachers = false;
		} else if (roomData.advOptState.now.data.any_teach_assign === 'This Room' || roomData.advOptState.now.data.all_teach_assign === 'This Room') {
			data.request_send_destination_teachers = true;
			data.request_send_origin_teachers = false;
		} else if (roomData.advOptState.now.data.selectedTeachers.length) {
			data.request_teachers = roomData.advOptState.now.data.selectedTeachers.map((t) => t.id);
		}
		if (roomData.advOptState.future.data.any_teach_assign === 'Both' || roomData.advOptState.future.data.all_teach_assign === 'Both') {
			data.scheduling_request_send_origin_teachers = true;
			data.scheduling_request_send_destination_teachers = true;
		} else if (roomData.advOptState.future.data.all_teach_assign === 'Origin' || roomData.advOptState.future.data.any_teach_assign === 'Origin') {
			data.scheduling_request_send_origin_teachers = true;
			data.scheduling_request_send_destination_teachers = false;
		} else if (
			roomData.advOptState.future.data.all_teach_assign === 'This Room' ||
			roomData.advOptState.future.data.any_teach_assign === 'This Room'
		) {
			data.scheduling_request_send_destination_teachers = true;
			data.scheduling_request_send_origin_teachers = false;
		} else if (roomData.advOptState.future.data.selectedTeachers.length) {
			data.scheduling_request_teachers = roomData.advOptState.future.data.selectedTeachers.map((t) => t.id);
		}
		data.enable = roomData.enable;
		return data;
	}

	public back(closeDialog: boolean = true): void {
		if (closeDialog) {
			this.dialogRef.close();
		} else {
			this.formService.setFrameMotionDirection('back');
			setTimeout(() => {
				const oldFolderData: FolderData = this.oldFolderData ? this.oldFolderData : this.folderData;
				if (this.overlayService.pageState.getValue().previousPage === OverlayPages.BulkEditRoomsInFolder) {
					if (!!this.pinnable) {
						this.overlayService.updatePage(OverlayPages.EditFolder, this.currentPage, { ...this.folderData, oldFolderData });
					} else {
						this.overlayService.updatePage(OverlayPages.NewFolder, this.currentPage, { ...this.folderData, oldFolderData });
					}
				} else {
					this.overlayService.back({ ...this.folderData, oldFolderData });
				}
			}, 100);
		}
	}

	public showFormErrors(): void {
		if (this.form.get('roomName').invalid) {
			this.form.get('roomName').markAsDirty();
			this.form.get('roomName').setErrors(this.form.get('roomName').errors);
		}
		if (this.form.get('roomNumber').invalid) {
			this.form.get('roomNumber').markAsDirty();
			this.form.get('roomNumber').setErrors(this.form.get('roomNumber').errors);
		}
		if (this.form.get('timeLimit').invalid) {
			this.form.get('timeLimit').markAsDirty();
			this.form.get('timeLimit').setErrors(this.form.get('timeLimit').errors);
		}
		if (this.passLimitForm.get('fromEnabled').value && this.passLimitForm.get('from').invalid) {
			this.passLimitForm.get('from').markAsDirty();
			this.passLimitForm.get('from').setErrors(this.passLimitForm.get('from').errors);
		}
		if (this.passLimitForm.get('toEnabled').value && this.passLimitForm.get('to').invalid) {
			this.passLimitForm.get('to').markAsDirty();
			this.passLimitForm.get('to').setErrors(this.passLimitForm.get('to').errors);
		}

		const visibilityControl = this.visibilityForm.get('visibility');
		if (visibilityControl.invalid) {
			visibilityControl.markAsDirty();
			visibilityControl.setErrors(visibilityControl.errors);
		}

		this.showErrors = true;
	}

	private catchError() {
		return catchError((err) => {
			this.showPublishSpinner = false;
			this.isSaveButtonDisabled = true;
			setTimeout(() => {
				this.dialogRef.close(true);
				this.isSaveButtonDisabled = false;
			}, 2000);
			throw err;
		});
	}

	private createOrUpdateLocation(location, category: string): Observable<Location> {
		const locationData = cloneDeep(location);
		locationData.category = category;
		if (this.visibilityForm.dirty && location?.visibility_students) {
			locationData.visibility_students = locationData.visibility_students.map((s: User) => s.id);
		} else if (this.visibilityForm.pristine) {
			delete locationData?.visibility_students;
			delete locationData?.visibility_type;
			delete locationData?.visibility_grade;
		}

		if (!location.id) {
			locationData.teachers = location.teachers.map((t) => t.id);
			return this.locationService.createLocation(locationData);
		}

		if (!location.max_passes_to_active && location.enable_queue) {
			locationData.max_passes_to_active = true;
		}
		if (location.teachers) {
			locationData.teachers = locationData.teachers.map((teacher) => +teacher.id);
		}

		return this.locationService.updateLocation(location.id, locationData);
	}

	private getIconString(): string {
		return (this.selectedIcon as Icon)?.inactive_icon ?? (typeof this.selectedIcon === 'string' ? this.selectedIcon : '');
	}

	private isPinnableChanged(): boolean {
		return (
			this.folderData.folderName !== this.pinnable.title ||
			this.color_profile.id !== this.pinnable.color_profile.id ||
			this.getIconString() !== this.pinnable.icon ||
			this.folderData.ignore_students_pass_limit !== this.pinnable.ignore_students_pass_limit ||
			this.folderData.show_as_origin_room !== this.pinnable.show_as_origin_room
		);
	}

	public onPublish(): void {
		this.showPublishSpinner = true;
		this.isSaveButtonDisabled = true;

		if (this.currentPage === OverlayPages.NewRoom) {
			const location = {
				title: this.roomData.roomName,
				room: this.roomData.roomNumber,
				restricted: !!this.roomData.restricted,
				scheduling_restricted: !!this.roomData.scheduling_restricted,
				needs_check_in: !!this.roomData.needs_check_in,
				teachers: this.roomData.selectedTeachers.map((teacher) => teacher.id),
				travel_types: this.roomData.travelType,
				max_allowed_time: +this.roomData.timeLimit,
				max_passes_from: +this.passLimitForm.get('from').value,
				max_passes_from_active: this.passLimitForm.get('fromEnabled').value,
				max_passes_to: this.passLimitForm.get('to').valid ? +this.passLimitForm.get('to').value : 0,
				max_passes_to_active: this.passLimitForm.get('toEnabled').value && this.passLimitForm.get('to').valid,
				enable: this.isOpenRoom,
				visibility_type: this.visibility.mode,
				visibility_students: this.visibility.over.map((el: User) => el.id),
				visibility_grade: this.visibility.grade,
				...this.normalizeAdvOptData(),
			};
			this.locationService
				.createLocationRequest(location)
				.pipe(
					filter((res) => !!res),
					take(1),
					switchMap((loc: Location) => {
						const pinnable = {
							title: this.roomData.roomName,
							color_profile: this.color_profile.id,
							icon: (this.selectedIcon as Icon)?.inactive_icon,
							location: loc.id,
							ignore_students_pass_limit: this.roomData.ignore_students_pass_limit,
							show_as_origin_room: this.roomData.show_as_origin_room,
						};
						return this.hallPassService.postPinnableRequest(pinnable);
					}),
					takeUntil(this.destroy$),
					this.catchError()
				)
				.subscribe((response) => {
					this.toast.openToast({ title: 'New room added', type: 'success' });
					this.isSaveButtonDisabled = false;
					this.dialogRef.close(true);
				});
		}

		/**
		 * Creating a new folder means:
		 * - there is no pinnable attached to this folder, therefore this.pinnable is undefined
		 * - there are at be at least 0 rooms in this folder
		 * - a new category must be created
		 * - there can be no rooms to delete in a new folder since the folder did not exist before
		 */
		if (this.currentPage === OverlayPages.NewFolder) {
			const category = `${this.folderData.folderName} ${this.generateRandomString()}`;
			const pinnableData = {
				// data to create the pinnable
				title: this.folderData.folderName,
				color_profile: this.color_profile.id,
				icon: this.getIconString(),
				ignore_students_pass_limit: this.folderData.ignore_students_pass_limit,
				show_as_origin_room: this.folderData.show_as_origin_room,
				category,
			};

			const roomsInFolderUpdateRequests$ =
				this.folderData.roomsInFolder.length === 0
					? [of([])]
					: this.folderData.roomsInFolder.map((room) => this.createOrUpdateLocation(room, category));

			// delete pinnables for locations being added into category
			const pinnablesToDeleteRequest$ =
				this.pinnableToDeleteIds.length === 0
					? of([])
					: zip(...this.pinnableToDeleteIds.map((id) => this.hallPassService.deletePinnableRequest(id, true)));

			zip(...roomsInFolderUpdateRequests$, pinnablesToDeleteRequest$)
				.pipe(
					switchMap(() => {
						return zip(
							this.hallPassService.pinnables$.pipe(take(1)),
							this.hallPassService.postPinnableRequest(pinnableData).pipe(filter((res) => !!res))
						).pipe(
							switchMap((result: any[]) => {
								const arrangedSequence = result[0].map((item) => item.id);
								arrangedSequence.push(result[1].id);
								return this.hallPassService.createArrangedPinnableRequest({ order: arrangedSequence.join(',') });
							})
						);
					}),
					takeUntil(this.destroy$),
					this.catchError()
				)
				.subscribe({
					next: () => {
						this.toast.openToast({ title: 'New folder added', type: 'success' });
						this.isSaveButtonDisabled = false;
						this.dialogRef.close(true);
					},
				});
		}

		/**
		 * Editing a folder means:
		 * - a pinnable has already been created for this folder, therefore this.pinnable **should** be defined
		 *   (throw a developer-level error if this.pinnable is somehow undefined, since this should not happen)
		 * - data irrelevant to contained rooms may have changed (title, icon, color profile)
		 * - data relevant to rooms may have changed:
		 *   - added rooms
		 *   - delete rooms
		 *   - edited rooms
		 * - the folder may contain at least 0 rooms
		 * - the category should not be updated
		 */
		if (this.currentPage === OverlayPages.EditFolder) {
			const pinnableData = {
				// data to create the pinnable
				title: this.folderData.folderName,
				ignore_students_pass_limit: this.folderData.ignore_students_pass_limit,
				show_as_origin_room: this.folderData.show_as_origin_room,
				color_profile: this.color_profile.id,
				icon: this.getIconString(),
			};

			if (!this.pinnable) {
				throw new Error('Pinnable is supposed to exist if editing a folder!');
			}

			console.log(`Pinnable changed: ${this.isPinnableChanged()}`);
			const pinnableUpdateRequest$: Observable<Pinnable[]> = this.isPinnableChanged()
				? this.hallPassService.updatePinnableRequest(this.pinnable.id, pinnableData).pipe(take(1), takeUntil(this.destroy$), this.catchError())
				: of(null);

			const roomDeletionRequest$ = forkJoin(
				this.folderData.roomIdsToDelete.length
					? this.folderData.roomIdsToDelete.map((roomId) => this.locationService.deleteLocationRequest(roomId).pipe(filter((res) => !!res)))
					: [of(null)]
			).pipe(takeUntil(this.destroy$));

			const existingOrNewRoomRequests$: Observable<Location>[] = this.folderData.roomsInFolder
				.filter((room) => room.isEdit || !room.category)
				.map((room) => {
					return this.createOrUpdateLocation(room, this.pinnable.category);
				});

			forkJoin([pinnableUpdateRequest$, roomDeletionRequest$, ...existingOrNewRoomRequests$])
				.pipe(
					concatMap(() => {
						if (this.pinnableToDeleteIds.length === 0) {
							return of(null);
						}

						return zip(...this.pinnableToDeleteIds.map((id) => this.hallPassService.deletePinnableRequest(id, true)));
					}),
					takeUntil(this.destroy$),
					this.catchError()
				)
				.subscribe({
					next: () => {
						this.toast.openToast({ title: 'Folder updated', type: 'success' });
						this.isSaveButtonDisabled = false;
						this.dialogRef.close(true);
					},
				});
		}

		if (this.currentPage === OverlayPages.EditRoom) {
			const location: Partial<Location> = {
				title: this.roomData.roomName,
				room: this.roomData.roomNumber,
				restricted: !!this.roomData.restricted,
				scheduling_restricted: !!this.roomData.scheduling_restricted,
				needs_check_in: !!this.roomData.needs_check_in,
				teachers: this.roomData.selectedTeachers.map((teacher) => teacher.id) as number[],
				travel_types: this.roomData.travelType,
				max_allowed_time: +this.roomData.timeLimit,
				max_passes_from: +this.passLimitForm.get('from').value,
				max_passes_from_active: this.passLimitForm.get('fromEnabled').value,
				max_passes_to: this.passLimitForm.get('to').valid ? +this.passLimitForm.get('to').value : 0,
				max_passes_to_active: this.passLimitForm.get('toEnabled').value && this.passLimitForm.get('to').valid,
				enable: this.roomData.enable,
				visibility_type: this.visibility.mode,
				visibility_students: this.visibility.over.map((el: User) => el.id) as number[],
				visibility_grade: this.visibility.grade,
			};

			const mergedData = { ...location, ...this.normalizeAdvOptData() };

			this.locationService
				.updateLocationRequest(this.pinnable.location.id, mergedData)
				.pipe(
					filter((res) => !!res),
					take(1),
					switchMap((loc: Location) => {
						const pinnable = {
							title: this.roomData.roomName,
							color_profile: this.color_profile.id,
							icon: (this.selectedIcon as Icon)?.inactive_icon,
							location: loc.id,
							ignore_students_pass_limit: this.roomData.ignore_students_pass_limit,
							show_as_origin_room: this.roomData.show_as_origin_room,
						};
						return this.hallPassService.updatePinnableRequest(this.pinnable.id, pinnable);
					})
				)
				.pipe(take(1), takeUntil(this.destroy$))
				.subscribe(() => {
					this.toast.openToast({ title: 'Room updated', type: 'success' });
					this.isSaveButtonDisabled = false;
					this.dialogRef.close(true);
				});
		}

		if (this.currentPage === OverlayPages.BulkEditRooms) {
			const patchRequests$ = this.bulkEditData.rooms.map((room) => {
				// ensure we have visibility data
				const { mode, over, grade } = this.bulkEditData.roomData?.visibility ?? DEFAULT_VISIBILITY_STUDENTS;
				const visibilityBulkData = {
					visibility_type: mode,
					visibility_students: over.map((s) => '' + s.id),
					visibility_grade: grade,
				};

				const data = {
					...room,
					teachers: (room.teachers as User[]).map((t) => t.id),
					...visibilityBulkData,
				};
				// apply bulk visibility only if user wanted it explicitly
				// otherwise avoid updating existing visibility by deleting concerned request data
				if (!this.visibilityForm.dirty) {
					delete data.visibility_students;
					delete data.visibility_type;
					delete data.visibility_grade;
				}
				return this.locationService.updateLocationRequest(room.id, data).pipe(filter((res) => !!res));
			});

			const patchPinnables$: Observable<Pinnable[]>[] = this.bulkEditData.pinnables.map((pinnable: Pinnable) => {
				const pinnableData: Partial<Pinnable> = {
					ignore_students_pass_limit: pinnable.ignore_students_pass_limit,
					show_as_origin_room: pinnable.show_as_origin_room,
				};
				return this.hallPassService.updatePinnableRequest(pinnable.id, pinnableData).pipe(filter((res) => !!res));
			});
			// Using a zip here was causing the pinnables to not be updated when opening them again.
			// Using a take(1) prevents multiple toasts from opening.
			combineLatest([patchRequests$, patchPinnables$])
				.pipe(take(1))
				.subscribe((res) => {
					this.toast.openToast({ title: 'Rooms updated', type: 'success' });
					this.isSaveButtonDisabled = false;
					this.dialogRef.close(true);
				});
		}
	}

	public handleDragEvent(evt: DragEvent, dropAreaColor: string): void {
		evt.preventDefault();
		this.overlayService.dragEvent$.next(dropAreaColor);
	}

	public roomResult(result: RoomDataResult): void {
		this.roomData = result.data;
		this.isOpenRoom = this.roomData.enable;
		this.roomValidButtons.next(result.buttonState);
	}

	public folderResult(result: FolderDataResult): void {
		this.folderData = result.data;
		this.roomValidButtons.next(result.buttonState);
		this.visibilityForm.setValue({ visibility: this.visibility });
		this.visibilityForm.markAsDirty();
	}

	public newRoomInFolder(room: RoomData): void {
		this.oldFolderData = cloneDeep(this.folderData);
		this.isOpenRoom = room.enable;
		this.folderData.roomsInFolder.push({
			...this.normalizeRoomData(room),
			...this.normalizeAdvOptData(room),
			isEdit: true,
		});
		this.form.get('roomName').reset();
		this.form.get('roomNumber').reset();
		this.form.get('timeLimit').reset();
		this.overlayService.back({ ...this.folderData, oldFolderData: this.oldFolderData, pinnable: this.pinnable });
	}

	public editRoomFolder(room: RoomData): void {
		this.oldFolderData = cloneDeep(this.folderData);
		this.isOpenRoom = room.enable;
		this.folderData.roomsInFolder = this.folderData.roomsInFolder.filter((r) => r.id !== room.id);
		this.folderData.roomsInFolder.push({
			...this.normalizeRoomData(room),
			...this.normalizeAdvOptData(room),
			isEdit: true,
		});
		this.overlayService.back({ ...this.folderData, oldFolderData: this.oldFolderData, pinnable: this.pinnable });
	}

	public addToFolder(rooms: Pinnable[]): void {
		this.oldFolderData = cloneDeep(this.folderData);
		this.pinnableToDeleteIds = rooms.map((pin) => +pin.id);
		const locationsToAdd: any[] = rooms.map((room) => {
			return {
				...room.location,
				isEdit: true,
			};
		});
		this.folderData.roomsInFolder = [...locationsToAdd, ...this.folderData.roomsInFolder];
		this.overlayService.back({ ...this.folderData, oldFolderData: this.oldFolderData });
	}

	public bulkEditInFolder(result: BulkEditDataResult): void {
		this.oldFolderData = cloneDeep(this.folderData);
		this.folderData.roomsInFolder = differenceBy(this.folderData.roomsInFolder, result.rooms, 'id');
		const editingRooms: any[] = this.editRooms(result.roomData, result.rooms);
		this.folderData.roomsInFolder = [...editingRooms, ...this.folderData.roomsInFolder];
		if (this.overlayService.pageState.getValue().previousPage === OverlayPages.ImportRooms) {
			if (!!this.pinnable) {
				this.overlayService.updatePage(OverlayPages.EditFolder, this.currentPage, { ...this.folderData, oldFolderData: this.oldFolderData });
			} else {
				this.overlayService.updatePage(OverlayPages.NewFolder, this.currentPage, { ...this.folderData, oldFolderData: this.oldFolderData });
			}
		} else {
			this.overlayService.back({ ...this.folderData, oldFolderData: this.oldFolderData });
		}
	}

	public bulkEditResult(result: BulkEditDataResult): void {
		const editingPinnables: Pinnable[] = this.editPinnables(result.roomData, result.pinnables);
		const editingRooms: any[] = this.editRooms(result.roomData, result.rooms);
		this.bulkEditData = { roomData: result.roomData, rooms: editingRooms, pinnables: editingPinnables };
		this.roomValidButtons.next(result.buttonState);
	}

	public deleteRoomInFolder(roomId: number): void {
		this.oldFolderData = cloneDeep(this.folderData);
		if (!isString(roomId)) {
			this.folderData.roomIdsToDelete.push(roomId);
		}
		this.folderData.roomsInFolder = this.folderData.roomsInFolder.filter((r) => r.id !== roomId);
		this.overlayService.back({ ...this.folderData, oldFolderData: this.oldFolderData });
	}

	private editPinnables(roomData: any, pinnables: Pinnable[]): Pinnable[] {
		return pinnables.map((pin: Pinnable) => {
			pin.ignore_students_pass_limit = roomData.ignore_students_pass_limit;
			pin.show_as_origin_room = roomData.show_as_origin_room;
			return pin;
		});
	}

	private editRooms(roomData: RoomData, rooms: RoomInFolder[]): RoomInFolder[] {
		return rooms.map((room) => {
			room.restricted = !!roomData.restricted;
			room.scheduling_restricted = !!roomData.scheduling_restricted;
			room.needs_check_in = !!roomData.needs_check_in;
			room.visibility = roomData.visibility;
			if (roomData.travelType.length) {
				room.travelType = roomData.travelType;
			}

			if (roomData.timeLimit) {
				room.timeLimit = roomData.timeLimit;
			} else {
				room.timeLimit = room.max_allowed_time;
			}

			room.roomName = room.title;
			room.roomNumber = room.room;
			room.selectedTeachers = (room.teachers as User[]).concat(...roomData.selectedTeachers);
			room.max_passes_to_active = roomData.advOptState.toEnabled;
			room.max_passes_to = Number(roomData.advOptState.to);

			const nroomdata = this.normalizeRoomData(room);
			const nadvdata = this.normalizeAdvOptData(roomData);

			const composited = {
				...nroomdata,
				...nadvdata,
				isEdit: true,
			};

			return composited;
		});
	}

	private normalizeRoomData(room: RoomData | RoomInFolder): RoomInFolder {
		const result = {
			id: room.id,
			title: room.roomName,
			room: room.roomNumber,
			restricted: !!room.restricted,
			scheduling_restricted: !!room.scheduling_restricted,
			needs_check_in: !!room.needs_check_in,
			teachers: room.selectedTeachers,
			// TODO: Make every single travelType prop into travel_types to avoid this kind of error in the future
			travel_types: room.travelType ?? room.travel_types,
			max_allowed_time: +room.timeLimit,
			max_passes_from: +this.passLimitForm.get('from').value,
			max_passes_from_active: false,
			max_passes_to: +this.passLimitForm.get('to').value,
			max_passes_to_active: !!this.passLimitForm.get('toEnabled').value,
			enable: room.enable,
			visibility_students: room.visibility?.over || DEFAULT_VISIBILITY_STUDENTS.over,
			visibility_type: room.visibility?.mode || DEFAULT_VISIBILITY_STUDENTS.mode,
			visibility_grade: room.visibility?.grade || DEFAULT_VISIBILITY_STUDENTS.grade,
		};
		return result;
	}

	private generateRandomString(): string {
		let random = '';
		const characters = 'qwertyu';
		for (let i = 0; i < characters.length; i++) {
			random += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return random;
	}

	public openCloseRoomToggle(event: PointerEvent): void {
		const options = [
			{
				display: this.isOpenRoom ? 'Close' : 'Open',
				color: this.isOpenRoom ? '#DA2370' : '#00B476',
				buttonColor: '#DA2370, #FB434A',
				action: this.isOpenRoom ? 'close' : 'open',
			},
		];
		const CM = this.dialog.open(ConsentMenuComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { trigger: new ElementRef(event.currentTarget), options },
		});

		CM.afterClosed()
			.pipe(filter((res) => !!res))
			.subscribe((value) => {
				this.enableRoomTrigger.next(value === 'open');
			});
	}

	public catchFile(evt: DragEvent): void {
		evt.preventDefault();
		this.overlayService.dropEvent$.next(evt);
	}

	private setToEditRoom(_room: Location): void {
		setTimeout(() => {
			this.overlayService.updatePage(OverlayPages.EditRoomInFolder, OverlayPages.NewRoom, {
				selectedRoomsInFolder: [_room],
			});
		}, 10);
	}

	public closeDisableRoomNux(): void {
		this.showNuxTooltip.next(false);
		this.userService.updateIntrosDisableRequest(this.introsData, 'universal', '1');
	}
}
