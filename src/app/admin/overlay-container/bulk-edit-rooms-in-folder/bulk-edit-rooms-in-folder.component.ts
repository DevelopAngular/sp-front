import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OverlayDataService, Pages, RoomData } from '../overlay-data.service';
import { Location } from '../../../models/Location';
import { ValidButtons } from '../advanced-options/advanced-options.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { isNull } from 'lodash';

@Component({
	selector: 'app-bulk-edit-rooms-in-folder',
	templateUrl: './bulk-edit-rooms-in-folder.component.html',
	styleUrls: ['./bulk-edit-rooms-in-folder.component.scss'],
})
export class BulkEditRoomsInFolderComponent implements OnInit {
	@Input() form: FormGroup;

	@Input() passLimitForm: FormGroup;

	@Input() visibilityForm?: FormGroup;

	@Input() showErrors: boolean;

	@Input() isEnableRoomTrigger$: Subject<boolean>;

	@Output() back = new EventEmitter();

	@Output()
	bulkEditResult: EventEmitter<{
		rooms: Location[];
		roomData: RoomData;
	}> = new EventEmitter<{ rooms: any[]; roomData: RoomData }>();

	@Output() errorsEmit: EventEmitter<any> = new EventEmitter<any>();

	advOptionsButtons: ValidButtons;

	roomsValidButtons: BehaviorSubject<ValidButtons> = new BehaviorSubject<ValidButtons>({
		publish: false,
		incomplete: false,
		cancel: false,
	});

	roomData: RoomData;

	selectedRoomsInFolder: any[];

	constructor(private overlayService: OverlayDataService) {}

	get showSave() {
		return this.roomsValidButtons.getValue().publish && this.visibilityForm.valid;
	}

	get showIncomplete() {
		return this.roomsValidButtons.getValue().incomplete || this.visibilityForm.invalid;
	}

	get showCancel() {
		return this.roomsValidButtons.getValue().cancel;
	}

	get isImportState() {
		return this.overlayService.pageState.getValue().previousPage === Pages.ImportRooms;
	}

	ngOnInit() {
		this.selectedRoomsInFolder = this.overlayService.pageState.getValue().data.selectedRoomsInFolder;
	}

	goBack() {
		this.back.emit();
	}

	roomResult({ data, buttonState, advOptButtons }) {
		this.roomData = data;
		this.advOptionsButtons = advOptButtons;
		this.checkValidForm();
	}

	checkValidForm() {
		if (this.isImportState) {
			if (this.roomData.travelType.length && this.roomData.timeLimit && !this.advOptionsButtons) {
				this.roomsValidButtons.next({ publish: true, cancel: true, incomplete: false });
			} else if (
				this.roomData.travelType.length &&
				// !isNull(this.roomData.restricted) &&
				// !isNull(this.roomData.scheduling_restricted) &&
				this.roomData.timeLimit &&
				this.advOptionsButtons
			) {
				// if (this.advOptionsButtons.incomplete) {
				//   this.roomsValidButtons.next({publish: false, incomplete: true, cancel: true});
				// } else {
				this.roomsValidButtons.next({ publish: true, incomplete: false, cancel: true });
				// }
			} else {
				this.roomsValidButtons.next({ publish: false, cancel: true, incomplete: true });
			}
		} else {
			if (
				(this.roomData.travelType.length ||
					!isNull(this.roomData.restricted) ||
					!isNull(this.roomData.scheduling_restricted) ||
					!isNull(this.roomData.ignore_students_pass_limit) ||
					this.roomData.timeLimit ||
					this.roomData.selectedTeachers.length) &&
				!this.advOptionsButtons
			) {
				this.roomsValidButtons.next({ publish: true, incomplete: false, cancel: true });
			} else if (
				this.roomData.travelType.length ||
				!isNull(this.roomData.restricted) ||
				!isNull(this.roomData.scheduling_restricted) ||
				!isNull(this.roomData.ignore_students_pass_limit) ||
				this.roomData.timeLimit ||
				this.roomData.selectedTeachers.length ||
				this.advOptionsButtons
			) {
				if (this.advOptionsButtons.incomplete) {
					this.roomsValidButtons.next({ publish: false, incomplete: true, cancel: true });
				} else {
					this.roomsValidButtons.next({ publish: true, incomplete: false, cancel: true });
				}
			}
		}
		if (this.visibilityForm.invalid) {
			this.roomsValidButtons.next({ publish: false, incomplete: true, cancel: true });
		}
	}

	save() {
		if (this.roomsValidButtons.getValue().incomplete) {
			this.errorsEmit.emit();
			return;
		}
		this.bulkEditResult.emit({
			roomData: this.roomData,
			rooms: this.selectedRoomsInFolder,
		});
	}
}
