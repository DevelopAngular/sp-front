import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {BehaviorSubject, Subject} from 'rxjs';

import {RoomData} from '../overlay-data.service';
import {ValidButtons} from '../advanced-options/advanced-options.component';

@Component({
  selector: 'app-edit-room-in-folder',
  templateUrl: './edit-room-in-folder.component.html',
  styleUrls: ['./edit-room-in-folder.component.scss']
})
export class EditRoomInFolderComponent implements OnInit {

    @Input() form: FormGroup;

    @Input() passLimitForm: FormGroup;

    @Input() isEnableRoomTrigger$: Subject<boolean>;

    @Input() showErrors: boolean;

    @Output() back = new EventEmitter();
    @Output() deleteRoom = new EventEmitter();

    @Output() roomDataResult: EventEmitter<{data: RoomData, buttonState: ValidButtons}> = new EventEmitter<{data: RoomData, buttonState: ValidButtons}>();

    @Output() save: EventEmitter<RoomData> = new EventEmitter<RoomData>();

    @Output() errorsEmit: EventEmitter<any> = new EventEmitter<any>();

    roomValidButtons = new BehaviorSubject<ValidButtons>({
        publish: false,
        incomplete: false,
        cancel: false
    });

    roomInFolderData: RoomData = {
        roomName: '',
        roomNumber: '',
        timeLimit: '',
        selectedTeachers: [],
        travelType: [],
        restricted: null,
        scheduling_restricted: null,
        advOptState: {
            now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
            future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
        },
        enable: true
    };

    constructor() { }

    get showSave() {
        return this.roomValidButtons.getValue().publish;
    }

    get showIncomplete() {
        return this.roomValidButtons.getValue().incomplete;
    }

    get showCancel() {
        return this.roomValidButtons.getValue().cancel;
    }

  ngOnInit() {}

  goBack() {
    this.back.emit();
  }

  saveInFolder() {
    if (this.roomValidButtons.getValue().incomplete) {
      this.errorsEmit.emit();
      return;
    }
     this.save.emit(this.roomInFolderData);
  }

  roomResult({data, buttonState}) {
    this.roomInFolderData = data;
    this.roomValidButtons.next(buttonState);
    this.roomDataResult.emit({data, buttonState});
  }

  deleteRoomEvent() {
    this.deleteRoom.emit(this.roomInFolderData);
  }

}
