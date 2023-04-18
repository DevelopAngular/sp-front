import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DomSanitizer} from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { BehaviorSubject, interval, merge, Subject, zip } from 'rxjs';

import { Location } from '../../../models/Location';
import { Pinnable } from '../../../models/Pinnable';
import { User } from '../../../models/User';
import { LocationsService } from '../../../services/locations.service';
import { OverlayContainerComponent } from '../overlay-container.component';
import { HallPassesService } from '../../../services/hall-passes.service';
import {
	FolderData,
	OverlayDataService,
	Pages,
	PageStateData,
	TooltipText,
} from '../overlay-data.service';
import { CreateFormService } from '../../../create-hallpass-forms/create-form.service';
import { OptionState, ValidButtons } from '../advanced-options/advanced-options.component';

import { cloneDeep, differenceBy, isEqual, sortBy } from 'lodash';
import { NextStep } from '../../../animations';
import { filter, mapTo, takeUntil, tap } from 'rxjs/operators';
import { ScrollPositionService } from '../../../scroll-position.service';
import { UNANIMATED_CONTAINER } from '../../../consent-menu-overlay';
import { ConsentMenuComponent } from '../../../consent-menu/consent-menu.component';
import { ToastService } from '../../../services/toast.service';

@Component({
	selector: 'app-folder',
	templateUrl: './folder.component.html',
	styleUrls: ['./folder.component.scss'],
	animations: [NextStep],
})
export class FolderComponent implements OnInit, OnDestroy {
	@Input() form: FormGroup;

	@Output() folderDataResult: EventEmitter<{ data: FolderData; buttonState: ValidButtons }> = new EventEmitter<{
		data: FolderData;
		buttonState: ValidButtons;
	}>();

	private scrollableAreaName: string;
	private scrollableArea: HTMLElement;

	@ViewChild('scrollableArea', { static: true }) set scrollable(scrollable: ElementRef) {
		if (scrollable) {
			this.scrollableArea = scrollable.nativeElement;

			const updatePosition = function () {
				const scrollObserver = new Subject();
				const initialHeight = this.scrollableArea.scrollHeight;
				const scrollOffset = this.scrollPosition.getComponentScroll(this.folderNameTitle);

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

	public currentPage: number;

	private roomsToDelete: any[] = [];

	private initialFolderData: Pick<FolderData, 'folderName' | 'roomsInFolder'	| 'ignore_students_pass_limit' |
		'show_as_origin_room'>
	 = { folderName: null, roomsInFolder: [], ignore_students_pass_limit: false, show_as_origin_room: null };

	private folderButtonState: ValidButtons;

	private pinnable: Pinnable;

	private advOptState: OptionState = {
		now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
		future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
	};

	public roomsInFolder: any[] = [];
	public selectedRooms: any[] = [];
	private selectedRoomToEdit;

	public folderName: string = '';

	public buttonsInFolder = [
		{ title: 'New Room', icon: './assets/Plus (White).svg', page: Pages.NewRoomInFolder },
		{ title: 'Import Rooms', icon: null, page: Pages.ImportRooms },
		{ title: 'Add Existing', icon: null, page: Pages.AddExistingRooms },
	];

	public buttonsWithSelectedRooms = [
		{ title: 'Bulk Edit Rooms', action: Pages.BulkEditRoomsInFolder, color: '#FFFFFF, #FFFFFF', textColor: '#1F195E', hover: '#FFFFFF' },
		{ title: 'Delete Rooms', action: 'delete', textColor: '#FFFFFF', color: '#DA2370,#FB434A', hover: '#DA2370' },
	];

	public folderRoomsLoaded: boolean;

	private change$: Subject<any> = new Subject<any>();

	private frameMotion$: BehaviorSubject<any>;

	constructor(
		@Inject(MAT_DIALOG_DATA) public dialogData: any,
		public overlayService: OverlayDataService,
		private dialogRef: MatDialogRef<OverlayContainerComponent>,
		private dialog: MatDialog,
		private hallPassService: HallPassesService,
		private locationService: LocationsService,
		private sanitizer: DomSanitizer,
		private formService: CreateFormService,
		private scrollPosition: ScrollPositionService,
		private toast: ToastService
	) {}

	public get folderNameTitle(): string {
		if (this.overlayService.pageState.getValue().data && this.overlayService.pageState.getValue().data.pinnable) {
			return `Folder ${this.overlayService.pageState.getValue().data.pinnable.title}`;
		} else {
			return `Folder`;
		}
	}

	public get sortSelectedRooms(): Location[] {
		return sortBy(this.roomsInFolder, (res) => res.title.toLowerCase());
	}

	public tooltipText: TooltipText;

	public ngOnInit(): void {
		this.tooltipText = this.overlayService.tooltipText;

		this.form.get('folderName').setValidators([Validators.required, Validators.maxLength(17)]);
		this.scrollableAreaName = `Folder ${this.folderNameTitle}`;
		this.frameMotion$ = this.formService.getFrameMotionDirection();
		this.currentPage = this.overlayService.pageState.getValue().currentPage;
		const data: PageStateData = this.overlayService.pageState.getValue().data;

		if (data) {
			if (data.roomsInFolderLoaded) {
				this.initialFolderData = data.oldFolderData;
				this.folderName = data.folderName;
				this.roomsInFolder = data.roomsInFolder;
				this.roomsToDelete = data.roomsToDelete;
				this.folderRoomsLoaded = true;
			} else {
				this.initialFolderData.folderName = data.pinnable.title;
				this.initialFolderData.ignore_students_pass_limit = data.pinnable.ignore_students_pass_limit;
				this.initialFolderData.show_as_origin_room = data.pinnable.show_as_origin_room;
				this.pinnable = data.pinnable;
				this.folderName = this.pinnable.title;
				this.locationService.getLocationsWithCategory(this.pinnable.category).subscribe((res: Location[]) => {
					this.roomsInFolder = res;
					this.initialFolderData = {
						...this.initialFolderData,
						roomsInFolder: cloneDeep(this.roomsInFolder) as any[],
					};
					this.folderRoomsLoaded = true;
					this.updateFolderState(); // This function depends on initialFolder data, if it's not set it won't work.
				});
			}
		} else {
			if (this.dialogData['rooms']) {
				this.dialogData['rooms'].forEach((room: Pinnable) => {
					if (room.type === 'category') {
						this.locationService.getLocationsWithCategory(room.category).subscribe((res: Location[]) => {
							this.roomsInFolder = [...this.roomsInFolder, ...res];
							this.folderRoomsLoaded = true;
						});
					} else {
						this.roomsInFolder.push(room.location);
					}
				});
			}
			this.initialFolderData = {
				folderName: 'New Folder',
				roomsInFolder: cloneDeep(this.roomsInFolder) as any,
				ignore_students_pass_limit: false,
				show_as_origin_room: true,
			};
			this.folderRoomsLoaded = true;
		}

		merge(
			this.form.get('folderName').valueChanges,
			this.form.get('countsTowardsPassLimits').valueChanges,
			this.form.get('showAsOriginRoom').valueChanges,
			this.form.statusChanges,
			this.change$
		).subscribe(() => {
			this.updateFolderState();
		});
	}

	public ngOnDestroy(): void {
		this.form.get('folderName').setValidators([Validators.maxLength(17)]);
		this.scrollPosition.saveComponentScroll(this.folderNameTitle, this.scrollableArea.scrollTop);
	}

	private updateFolderState(): void {
		this.updateButtonState();

		this.folderDataResult.emit({
			data: {
				folderName: this.form.get('folderName').value === '' ? 'New Folder' : this.form.get('folderName').value,
				ignore_students_pass_limit: !this.form.get('countsTowardsPassLimits').value,
				show_as_origin_room: this.form.get('showAsOriginRoom').value,
				roomsInFolder: this.roomsInFolder as any,
				selectedRoomsInFolder: this.selectedRooms as any,
				roomsInFolderLoaded: true,
				selectedRoomToEdit: this.selectedRoomToEdit,
				roomsToDelete: this.roomsToDelete,
			},
			buttonState: this.folderButtonState,
		});
	}

	private updateButtonState(): void {
		// Compare the folder data and set the buttons availabe
		if (this.form.get('folderName').invalid) {
			this.folderButtonState = { publish: false, incomplete: true, cancel: true };
			return;
		}

		if (this.initialFolderData.folderName && this.initialFolderData.folderName !== this.form.get('folderName').value) {
			this.folderButtonState = { publish: true, incomplete: false, cancel: true };
			return;
		}

		if (!this.initialFolderData.ignore_students_pass_limit !== this.form.get('countsTowardsPassLimits').value) {
			this.folderButtonState = { publish: true, incomplete: false, cancel: true };
			return;
		}
		if (this.initialFolderData.show_as_origin_room !== this.form.get('showAsOriginRoom').value) {
			this.folderButtonState = { publish: true, incomplete: false, cancel: true };
			return;
		}

		if (!isEqual(this.initialFolderData.roomsInFolder, this.roomsInFolder)) {
			this.folderButtonState = { publish: true, incomplete: false, cancel: true };
			return;
		}

		this.folderButtonState = { publish: false, incomplete: false, cancel: false };
	}

	public stickyButtonClick(page): void {
		this.formService.setFrameMotionDirection('forward');
		setTimeout(() => {
			if (page === 'delete') {
				this.roomsInFolder = differenceBy(this.roomsInFolder, this.selectedRooms, 'id');
				this.roomsToDelete = cloneDeep(this.selectedRooms);
				this.selectedRooms = [];
			} else {
				this.overlayService.changePage(page, this.currentPage, {
					selectedRoomsInFolder: this.selectedRooms,
				});
			}
			this.change$.next();
		}, 50);
	}

	public setToEditRoom(room: any): void {
		this.selectedRoomToEdit = room;
		this.generateAdvOptionsModel(room);
		this.change$.next();

		const visibility = {
			mode: room.visibility_type,
			over: room.visibility_students.map((s) => {
				try {
					return User.fromJSON(s);
				} catch (e) {}
			}),
		};
		this.overlayService.changePage(Pages.EditRoomInFolder, this.currentPage, {
			advancedOptions: this.advOptState,
			visibility,
			selectedRoomsInFolder: [room],
		});
	}

	public selectedRoomsEvent(event: MatCheckboxChange, room: any, all?: boolean): void {
		this.formService.setFrameMotionDirection('forward');
		setTimeout(() => {
			if (all) {
				if (event.checked) {
					this.selectedRooms = this.roomsInFolder;
				} else {
					this.selectedRooms = [];
				}
			} else if (event.checked) {
				this.selectedRooms.push(room);
			} else {
				this.selectedRooms = this.selectedRooms.filter((readyRoom) => readyRoom.id !== room.id);
			}
		}, 100);
	}

	public deleteRoom(target: HTMLElement): void {
		const header = `Are you sure you want to permanently delete this folder? All associated passes associated with this rooms in this folder <b>will not</b> be deleted.`;
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
			.subscribe(() => {
				const pinnable = this.overlayService.pageState.getValue().data.pinnable;
				const deletions = [this.hallPassService.deletePinnableRequest(pinnable.id).pipe(mapTo(null))];

				if (pinnable.location) {
					deletions.push(this.locationService.deleteLocationRequest(pinnable.location.id));
				}

				zip(...deletions).subscribe((res) => {
					this.toast.openToast({ title: 'Folder deleted', type: 'error' });
					this.dialogRef.close();
				});
			});
	}

	private generateAdvOptionsModel(loc: any): OptionState {
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
			this.advOptState.now.data.selectedTeachers = loc.request_teachers;
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
			this.advOptState.future.data.selectedTeachers = loc.scheduling_request_teachers;
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
}
