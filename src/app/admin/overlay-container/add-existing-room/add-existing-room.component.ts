import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pinnable} from '../../../models/Pinnable';

@Component({
  selector: 'app-add-existing-room',
  templateUrl: './add-existing-room.component.html',
  styleUrls: ['./add-existing-room.component.scss']
})
export class AddExistingRoomComponent implements OnInit {

  @Input() roomsInFolder;
  @Input() pinnables: Pinnable[];
  @Input() roomName: string;

  @Output() back = new EventEmitter();
  @Output() save = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  goBack() {
    this.back.emit();
  }

  addRooms() {
    this.save.emit(this.roomsInFolder);
  }

}
