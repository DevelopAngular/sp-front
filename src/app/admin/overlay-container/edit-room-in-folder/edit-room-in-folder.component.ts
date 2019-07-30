import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RoomData } from '../overlay-data.service';

@Component({
  selector: 'app-edit-room-in-folder',
  templateUrl: './edit-room-in-folder.component.html',
  styleUrls: ['./edit-room-in-folder.component.scss']
})
export class EditRoomInFolderComponent implements OnInit {

    @Input() form: FormGroup;

    @Output() back = new EventEmitter();

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

    ngOnInit() {
    }

    goBack() {
        this.back.emit();
    }

    roomResult(data) {
        this.roomInFolderData = data;
    }

}