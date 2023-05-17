import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RoomData, RoomDataResult } from '../overlay-data.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { ValidButtons } from '../advanced-options/advanced-options.component';
import { DEFAULT_VISIBILITY_STUDENTS } from '../visibility-room/visibility-room.type';
import { slideOpacity } from '../../../animations';

@Component({
	selector: 'app-new-room-in-folder',
	templateUrl: './new-room-in-folder.component.html',
	styleUrls: ['./new-room-in-folder.component.scss'],
	animations: [slideOpacity],
})
export class NewRoomInFolderComponent {
	@Input() form: FormGroup;

	@Input() visibilityForm: FormGroup;

	@Input() passLimitForm: FormGroup;

	@Input() isEnableRoomTrigger$: Subject<boolean>;

	@Input() showErrors: boolean;

	@Output() back = new EventEmitter();

	@Output() roomDataResult: EventEmitter<RoomDataResult> = new EventEmitter<RoomDataResult>();

	@Output() add: EventEmitter<RoomData> = new EventEmitter<RoomData>();

	@Output() errorsEmit: EventEmitter<any> = new EventEmitter<any>();

	private roomValidButtons: BehaviorSubject<ValidButtons> = new BehaviorSubject<ValidButtons>({
		publish: false,
		incomplete: false,
		cancel: false,
	});

	public roomInFolderData: RoomData = {
		id: null,
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

	public get showPubish(): boolean {
		return this.roomValidButtons.getValue().publish && this.visibilityForm.valid;
	}

	public get showIncomplete(): boolean {
		return this.roomValidButtons.getValue().incomplete && this.visibilityForm.invalid;
	}

	public get showCancel(): boolean {
		return this.roomValidButtons.getValue().cancel;
	}

	public goBack(): void {
		this.back.emit();
	}

	public addInFolder(): void {
		if (this.roomValidButtons.getValue().incomplete) {
			this.errorsEmit.emit();
			return;
		}
		this.add.emit(this.roomInFolderData);
	}

	public roomResult(result: RoomDataResult): void {
		this.roomInFolderData = result.data;
		this.roomValidButtons.next(result.buttonState);
		this.roomDataResult.emit(result);
	}
}
