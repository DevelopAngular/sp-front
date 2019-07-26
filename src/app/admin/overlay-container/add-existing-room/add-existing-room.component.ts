import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pinnable } from '../../../models/Pinnable';
import { bumpIn } from '../../../animations';
import { FolderData } from '../overlay-data.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-add-existing-room',
  templateUrl: './add-existing-room.component.html',
  styleUrls: ['./add-existing-room.component.scss'],
  animations: [bumpIn]
})
export class AddExistingRoomComponent implements OnInit {

  @Input() roomsInFolder;
  @Input() set data(items: Pinnable[]) {
    this.pinnables = items;
  }
  @Input() roomName: string;

  @Output() back = new EventEmitter();
  @Output() save = new EventEmitter();

  buttonDown: boolean;
  pinnables: Pinnable[];

  constructor() { }

  get buttonState() {
      return this.buttonDown ? 'down' : 'up';
  }

  ngOnInit() {
  }

  onPress(press: boolean) {
      this.buttonDown = press;
  }

  goBack() {
    this.back.emit();
  }

  addRooms() {
    this.save.emit(this.roomsInFolder);
  }

}
