import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../../../animations';

@Component({
  selector: 'app-school-button',
  templateUrl: './school-button.component.html',
  styleUrls: ['./school-button.component.scss'],
  animations: [bumpIn]
})
export class SchoolButtonComponent implements OnInit {

  @Input() button;

  @Output() result: EventEmitter<any> = new EventEmitter<any>()

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


}
