import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { combineLatest, merge, Subject } from 'rxjs';
import { filter, pluck, takeUntil, tap } from 'rxjs/operators';

import { OverlayDataService, OverlayPages, RoomData, RoomDataResult, TooltipText } from '../overlay-data.service';
import { OptionState, ValidButtons } from '../advanced-options/advanced-options.component';
import { VisibilityOverStudents, DEFAULT_VISIBILITY_STUDENTS } from '../visibility-room/visibility-room.type';

import { HallPassesService } from '../../../services/hall-passes.service';
import { LocationsService } from '../../../services/locations.service';
import { OverlayContainerComponent } from '../overlay-container.component';

import { cloneDeep, isEqual, isNull, omit } from 'lodash';
import { KeyboardShortcutsService } from '../../../services/keyboard-shortcuts.service';
import { ConsentMenuComponent } from '../../../consent-menu/consent-menu.component';
import { UNANIMATED_CONTAINER } from '../../../consent-menu-overlay';
import { ToastService } from '../../../services/toast.service';
import { User } from '../../../models/User';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
	@Input() form: FormGroup;

	@Input() showErrors: boolean;

	@Input() passLimitForm: FormGroup;

	@Input() visibilityForm?: FormGroup;

	@Input() isEnableRoomTrigger$: Subject<boolean>;

	@Input() allowChangingIgnoreStudentsPassLimit: boolean;
	@Input() allowChangingShowAsOriginRoom = true;

	@Output() back = new EventEmitter();

	@Output()
	roomDataResult: EventEmitter<RoomDataResult> = new EventEmitter<RoomDataResult>();

	public data: RoomData = {
		id: null,
		roomName: 'New Room',
		roomNumber: '',
		timeLimit: 0,
		selectedTeachers: [],
		travelType: [],
		restricted: null,
		scheduling_restricted: null,
		ignore_students_pass_limit: false,
		needs_check_in: null,
		show_as_origin_room: this.allowChangingShowAsOriginRoom ? true : null,
		advOptState: {
			now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
			future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
		},
		visibility: DEFAULT_VISIBILITY_STUDENTS,
		enable: true,
	};

	private initialData: RoomData;

	public currentPage: OverlayPages;
	public tooltipText: TooltipText;
	public inputFocusNumber = 1;
	public forceFocus$: Subject<any> = new Subject<any>();

	private advOptionsValidButtons: ValidButtons = {
		publish: false,
		cancel: false,
		incomplete: false,
	};

	private roomValidButtons: ValidButtons;
	public PagesEnum = OverlayPages; // for use in template

	public travelType: string;
	public advDisabledOptions: string[];

	private change$: Subject<void> = new Subject();
	public resetadvOpt$: Subject<OptionState> = new Subject();
	private destroy$: Subject<void> = new Subject();

	constructor(
		private dialog: MatDialog,
		private dialogRef: MatDialogRef<OverlayContainerComponent>,
		public overlayService: OverlayDataService,
		private hallPassService: HallPassesService,
		private locationService: LocationsService,
		private shortcuts: KeyboardShortcutsService,
		private toast: ToastService
	) {}

	get validForm(): boolean {
		return this.form.get('roomName').valid && this.form.get('roomNumber').valid && this.form.get('timeLimit').valid;
	}

	get isValidRestrictions(): boolean {
		return !isNull(this.data.restricted) && !isNull(this.data.scheduling_restricted);
	}

	public ngOnInit(): void {
		this.form.get('roomName').setValidators([Validators.required, Validators.maxLength(15)]);
		this.tooltipText = this.overlayService.tooltipText;
		this.currentPage = this.overlayService.pageState.getValue().currentPage;

		if (this.overlayService.pageState.getValue().data) {
			if (this.currentPage === OverlayPages.EditRoom) {
				const pinnable = this.overlayService.pageState.getValue().data.pinnable;
				const visibility: VisibilityOverStudents = {
					mode: pinnable.location.visibility_type,
					over: pinnable.location.visibility_students as User[],
					grade: pinnable.location.visibility_grade,
				};
				this.overlayService.patchData({ visibility });
				this.data = {
					roomName: pinnable.location.title,
					roomNumber: pinnable.location.room,
					travelType: pinnable.location.travel_types,
					selectedTeachers: pinnable.location.teachers as User[],
					restricted: !!pinnable.location.restricted,
					scheduling_restricted: !!pinnable.location.scheduling_restricted,
					ignore_students_pass_limit: !!pinnable.ignore_students_pass_limit,
					show_as_origin_room: !!pinnable.show_as_origin_room,
					needs_check_in: !!pinnable.location.needs_check_in,
					timeLimit: pinnable.location.max_allowed_time,
					advOptState: this.overlayService.pageState.getValue().data.advancedOptions,
					visibility: this.overlayService.pageState.getValue().data?.visibility,
					enable: pinnable.location.enable,
				};
			} else if (this.currentPage === OverlayPages.EditRoomInFolder) {
				const data: any = this.overlayService.pageState.getValue().data.selectedRoomsInFolder[0];
				const visibility: VisibilityOverStudents = { mode: data.visibility_type, over: data.visibility_students, grade: data.visibility_grade };
				this.visibilityForm.patchValue({ visibility });
				this.overlayService.patchData({ visibility });
				this.passLimitForm.patchValue({
					to: data.max_passes_to,
					toEnabled: data.max_passes_to_active,
					from: data.max_passes_from,
					fromEnabled: data.max_passes_from_active,
				});
				this.data = {
					id: data.id,
					roomName: data.title,
					roomNumber: data.room,
					timeLimit: data.max_allowed_time,
					selectedTeachers: data.teachers,
					travelType: data.travel_types,
					restricted: !!data.restricted,
					scheduling_restricted: !!data.scheduling_restricted,
					// This technically should use the value of the pinnable, but since we don't show it, it doesn't matter.
					ignore_students_pass_limit: false,
					show_as_origin_room: false,
					needs_check_in: !!data.needs_check_in,
					advOptState: this.overlayService.pageState.getValue().data.advancedOptions,
					visibility: this.overlayService.pageState.getValue().data?.visibility,
					enable: data.enable,
				};
			}

			if (this.data.travelType.includes('round_trip') && this.data.travelType.includes('one_way')) {
				this.travelType = 'Both';
			} else if (this.data.travelType.includes('round_trip')) {
				this.travelType = 'Round-trip';
			} else if (this.data.travelType.includes('one_way')) {
				this.travelType = 'One-way';
			}

			if (
				!this.data.selectedTeachers.length &&
				(this.currentPage === OverlayPages.NewRoom ||
					this.currentPage === OverlayPages.EditRoom ||
					this.currentPage === OverlayPages.NewRoomInFolder ||
					this.currentPage === OverlayPages.EditRoomInFolder)
			) {
				this.advDisabledOptions = ['This Room', 'Both'];
			}
		}

		this.shortcuts.onPressKeyEvent$.pipe(takeUntil(this.destroy$), pluck('key')).subscribe((key) => {
			if (key[0] === 'tab') {
				if (this.inputFocusNumber < 3) {
					this.inputFocusNumber += 1;
				} else if (this.inputFocusNumber === 3) {
					this.inputFocusNumber = 1;
				}
				this.forceFocus$.next();
			}
		});

		this.initialData = cloneDeep(this.data);

		merge(combineLatest(this.form.valueChanges, this.form.statusChanges), this.change$)
			.pipe
			// debounceTime(450)
			()
			.subscribe(() => {
				this.checkValidRoomOptions();
			});

		this.isEnableRoomTrigger$?.subscribe((res) => {
			this.data.enable = res;
			this.change$.next();
		})
			? null
			: console.log('isEnableRoomTrigger$ undefined');
	}

	public ngOnDestroy(): void {
		this.form.get('roomName').setValidators([Validators.maxLength(15)]);
		this.destroy$.next();
		this.destroy$.complete();
		this.passLimitForm.reset();
		this.visibilityForm?.reset();
	}

	private checkValidRoomOptions(): void {
		if (isEqual(omit(this.initialData, 'advOptState'), omit(this.data, 'advOptState'))) {
			/**
			 * If the initial form and the changed form are equal, execution should be here
			 * */
			if (this.validForm) {
				this.roomValidButtons = {
					publish: false,
					incomplete: false,
					cancel: false,
				};
			} else {
				this.roomValidButtons = {
					publish: false,
					incomplete: false,
					cancel: false,
				};
			}
		} else {
			// If the form has changed
			if (this.validForm && this.data.travelType.length) {
				this.roomValidButtons = {
					publish: true,
					incomplete: false,
					cancel: true,
				};
			} else {
				// either form is invalid or there are no travel types for the room
				// travel types are one way and round trip
				this.roomValidButtons = {
					publish: false,
					incomplete: true,
					cancel: true,
				};
			}
		}
		let buttonsResult: ValidButtons = {
			publish: false,
			incomplete: false,
			cancel: false,
		};

		if (!this.advOptionsValidButtons?.publish) {
			// if there are no changes in advanced options, such as
			// active pass limits, restriction for now, restriction for future
			buttonsResult = this.roomValidButtons;
		} else {
			// either pass limits, restriction for now or restriction for future are changed
			if (
				(this.validForm && this.isValidRestrictions && this.data.travelType.length && this.advOptionsValidButtons.publish) ||
				(this.roomValidButtons.publish && !this.advOptionsValidButtons.incomplete)
			) {
				buttonsResult.publish = true;
			}
			if (this.roomValidButtons.cancel || this.advOptionsValidButtons.cancel) {
				buttonsResult.cancel = true;
			}
			if (this.roomValidButtons.incomplete || this.advOptionsValidButtons.incomplete) {
				buttonsResult.incomplete = true;
			}
		}

		if (this.visibilityForm?.invalid) {
			buttonsResult.incomplete = true;
		}

		this.roomDataResult.emit({ data: this.data, buttonState: buttonsResult, advOptButtons: this.advOptionsValidButtons });
	}

	public selectTeacherEvent(teachers): void {
		this.data.selectedTeachers = teachers;
		if (!this.data.selectedTeachers.length) {
			this.data.advOptState = {
				now: { state: 'Any teacher', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
				future: { state: 'Any teacher', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
			};
			this.resetadvOpt$.next(this.data.advOptState);
		}
		this.change$.next();
	}

	public travelUpdate(type: string): void {
		let travelType: string[];
		if (type === 'Round-trip') {
			travelType = ['round_trip'];
		} else if (type === 'One-way') {
			travelType = ['one_way'];
		} else if (type === 'Both') {
			travelType = ['round_trip', 'one_way'];
		}
		this.data.travelType = travelType;
		this.change$.next();
	}

	public restrictedEvent(isRestricted: boolean): void {
		this.data.restricted = isRestricted;
		this.change$.next();
	}

	public schedulingRestrictedEvent(isRestricted: boolean): void {
		this.data.scheduling_restricted = isRestricted;
		this.change$.next();
	}

	public checkInEvent(isRestricted: boolean): void {
		this.data.needs_check_in = isRestricted;
		this.change$.next();
	}

	public ignoreStudentsPassLimitEvent(isIgnored: boolean): void {
		this.data.ignore_students_pass_limit = isIgnored;
		this.change$.next();
	}

	public showAsOriginRoomEvent(isShown: boolean): void {
		this.data.show_as_origin_room = isShown;
		this.data.show_as_origin_room = isShown;
		this.change$.next();
	}

	public advancedOptions({ options, validButtons }): void {
		this.data.advOptState = options;
		this.advOptionsValidButtons = validButtons;
		this.change$.next();
	}

	public visibilityChange(visibility: VisibilityOverStudents): void {
		this.data.visibility = visibility;
		this.change$.next();
	}

	public deleteRoom(target: HTMLElement): void {
		const header = `Are you sure you want to permanently delete this room? All associated passes associated with this room <b>will not</b> be deleted.`;
		const options = [{ display: 'Confirm Delete', color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete' }];
		UNANIMATED_CONTAINER.next(true);
		const confirmDialog = this.dialog.open(ConsentMenuComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: { trigger: new ElementRef(target), header, options, adjustForScroll: true },
		});

		confirmDialog
			.afterClosed()
			.pipe(
				tap((res) => UNANIMATED_CONTAINER.next(false)),
				filter((action) => !!action)
			)
			.subscribe((action) => {
				const pinnable = this.overlayService.pageState.getValue().data.pinnable;
				if (this.currentPage === OverlayPages.EditRoom) {
					this.hallPassService.deletePinnableRequest(pinnable.id).subscribe((res) => {
						this.toast.openToast({ title: 'Room deleted', type: 'error' });
						this.dialogRef.close();
					});
				} else if (this.currentPage === OverlayPages.EditRoomInFolder) {
					this.locationService.deleteLocationRequest(this.data.id).subscribe((res) => {
						this.back.emit();
					});
				}
			});
	}
}
