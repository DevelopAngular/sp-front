import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {RoomData} from '../overlay-data.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {ValidButtons} from '../advanced-options/advanced-options.component';

@Component({
  selector: 'app-new-room-in-folder',
  templateUrl: './new-room-in-folder.component.html',
  styleUrls: ['./new-room-in-folder.component.scss']
})
export class NewRoomInFolderComponent implements OnInit {

  @Input() form: FormGroup;

  @Input() passLimitForm: FormGroup;

  @Input() isEnableRoomTrigger$: Subject<boolean>;

  @Input() showErrors: boolean;

  @Output() back = new EventEmitter();

  @Output() roomDataResult: EventEmitter<{data: RoomData, buttonState: ValidButtons}> = new EventEmitter<{data: RoomData, buttonState: ValidButtons}>();

  @Output() add: EventEmitter<RoomData> = new EventEmitter<RoomData>();

  @Output() errorsEmit: EventEmitter<any> = new EventEmitter<any>();

  roomValidButtons = new BehaviorSubject<ValidButtons>({
      publish: false,
      incomplete: false,
      cancel: false
  });

  roomInFolderData: RoomData = {
      id: '',
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

  get showPubish() {
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

  addInFolder() {
    if (this.roomValidButtons.getValue().incomplete) {
      this.errorsEmit.emit();
      return;
    }
    this.add.emit(this.roomInFolderData);
  }

  roomResult({data, buttonState}) {
    this.roomInFolderData = data;
    this.roomValidButtons.next(buttonState);
    this.roomDataResult.emit({data, buttonState});
  }

}
