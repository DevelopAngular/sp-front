import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Pinnable} from '../../../models/Pinnable';
import {bumpIn} from '../../../animations';

@Component({
  selector: 'app-add-existing-room',
  templateUrl: './add-existing-room.component.html',
  styleUrls: ['./add-existing-room.component.scss'],
  animations: [bumpIn]
})
export class AddExistingRoomComponent implements OnInit {

  @Input() roomsInFolder;
  @Input() pinnables: Pinnable[];
  @Input() roomName: string;

  @Output() back = new EventEmitter();
  @Output() save = new EventEmitter();

  buttonDown: boolean;

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
