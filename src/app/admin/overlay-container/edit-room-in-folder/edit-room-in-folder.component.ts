import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { RoomData } from '../overlay-data.service';
import { ValidButtons } from '../advanced-options/advanced-options.component';

@Component({
  selector: 'app-edit-room-in-folder',
  templateUrl: './edit-room-in-folder.component.html',
  styleUrls: ['./edit-room-in-folder.component.scss']
})
export class EditRoomInFolderComponent implements OnInit {

    @Input() form: FormGroup;

    @Output() back = new EventEmitter();

    @Output() save: EventEmitter<RoomData> = new EventEmitter<RoomData>();

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
        }
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

    ngOnInit() {
    }

    goBack() {
        this.back.emit();
    }

  saveInFolder() {
     this.save.emit(this.roomInFolderData);
  }

    roomResult({data, buttonState}) {
        this.roomInFolderData = data;
        this.roomValidButtons.next(buttonState);
    }

}
