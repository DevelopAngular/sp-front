import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';

import { RoomData, RoomDataResult } from '../overlay-data.service';
import { ValidButtons } from '../advanced-options/advanced-options.component';
import { DEFAULT_VISIBILITY_STUDENTS } from '../visibility-room/visibility-room.type';

@Component({
	selector: 'app-edit-room-in-folder',
	templateUrl: './edit-room-in-folder.component.html',
	styleUrls: ['./edit-room-in-folder.component.scss'],
})
export class EditRoomInFolderComponent implements OnInit {
	@Input() form: FormGroup;

	@Input() passLimitForm: FormGroup;

	@Input() visibilityForm: FormGroup;

	@Input() isEnableRoomTrigger$: Subject<boolean>;

	@Input() showErrors: boolean;

	@Output() back = new EventEmitter();
	@Output() deleteRoom: EventEmitter<number> = new EventEmitter();

	@Output() roomDataResult: EventEmitter<RoomDataResult> = new EventEmitter<RoomDataResult>();

	@Output() save: EventEmitter<RoomData> = new EventEmitter<RoomData>();

	@Output() errorsEmit: EventEmitter<any> = new EventEmitter<any>();

	private roomValidButtons: BehaviorSubject<ValidButtons> = new BehaviorSubject<ValidButtons>({
		publish: false,
		incomplete: false,
		cancel: false,
	});

	public roomInFolderData: RoomData = {
		roomName: '',
		roomNumber: '',
		timeLimit: '',
		selectedTeachers: [],
		travelType: [],
		restricted: null,
		scheduling_restricted: null,
		ignore_students_pass_limit: false,
		show_as_origin_room: true,
		needs_check_in: null,
		advOptState: {
			now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
			future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
		},
		visibility: DEFAULT_VISIBILITY_STUDENTS,
		enable: true,
	};

	constructor() {}

	public get showSave(): boolean {
		return this.roomValidButtons.getValue().publish && this.visibilityForm.valid;
	}

	public get showIncomplete(): boolean {
		return this.roomValidButtons.getValue().incomplete || this.visibilityForm.invalid;
	}

	public get showCancel(): boolean {
		return this.roomValidButtons.getValue().cancel;
	}

	public ngOnInit(): void {}

	public goBack(): void {
		this.back.emit();
	}

	public saveInFolder(): void {
		if (this.roomValidButtons.getValue().incomplete || this.visibilityForm.invalid) {
			this.errorsEmit.emit();
			return;
		}
		console.log(this.roomInFolderData);
		this.save.emit(this.roomInFolderData);
	}

	public roomResult(result: RoomDataResult): void {
		this.roomInFolderData = result.data;
		this.roomValidButtons.next(result.buttonState);
		this.roomDataResult.emit(result);
	}

	public deleteRoomEvent(): void {
		this.deleteRoom.emit(this.roomInFolderData.id);
	}
}
