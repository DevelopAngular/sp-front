import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit, OnChanges {

  @Input() currentDate = moment();

  public hour: number;
  public minutes: number;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    debugger;
  }

  ngOnInit() {
      this.hour = this.currentDate.hour();
      this.minutes = this.currentDate.minutes();
  }

}
