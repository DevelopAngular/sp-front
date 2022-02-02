import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../../animations';
import * as moment from 'moment';

@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    bumpIn
  ]
})
export class DateButtonComponent implements OnInit {

  @Input() date: { start: moment.Moment, end: moment.Moment };

  @Output() buttonClick: EventEmitter<any> = new EventEmitter();

  hover: boolean;
  pressed: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  bgColor() {
    if (this.hover) {
      if (this.pressed) {
        return '#EAEDF1';
      }
      return '#F0F2F5';
    }
    return '#FFFFFF';
  }

  dateText({start}): string {
    if (start.isSame(moment().subtract(3, 'days'), 'day')) {
      return 'Last 3 days';
    } else if (start.isSame(moment().subtract(7, 'days'), 'day')) {
      return  'Last 7 days';
    } else if (start.isSame(moment().subtract(30, 'days'), 'day')) {
      return 'Last 30 days';
    } else if (start.isSame(moment().subtract(90, 'days'), 'day')) {
      return 'Last 90 days';
    } else if (start.isSame(moment('1/8/' + moment().subtract(1, 'year').year(), 'DD/MM/YYYY'))) {
      return 'This school year';
    } else if (start.isSame(moment(), 'day')) {
      return 'Today';
    }
    return 'Custom';
  }

  selectedDate({start, end}) {
    if (!end) {
      if (moment(start).isSame(moment(), 'day')) {
        return moment(start).format('MMM DD') + ' - Today';
      } else if (moment(start).isSame(moment().add(1, 'day'), 'day')) {
        return moment(start).format('MMM DD') + ' - Tomorrow';
      } else if (moment(start).isSame(moment().subtract(1, 'day'), 'day')) {
        return moment(start).format('MMM DD') + ' - Yesterday';
      } else {
        return moment(start).format('MMM DD');
      }
    }
    return start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
  }

}
