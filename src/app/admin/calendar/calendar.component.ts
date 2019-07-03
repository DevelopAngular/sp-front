import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TimeService } from '../../services/time.service';
import {Moment} from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  triggerElementRef: ElementRef;
  previousSelectedDate: moment.Moment;
  default: Date = undefined;
  elementPosition;

  @HostListener('window:resize', ['$event.target'])
    onResize() {
      this.updateCalendarPosition();
    }

  constructor(
  @Inject(MAT_DIALOG_DATA) public data: any[],
      private _matDialogRef: MatDialogRef<CalendarComponent>,
      private timeService: TimeService,
  ) {}

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.previousSelectedDate = moment(this.data['previousSelectedDate']);
    this.updateCalendarPosition();
    this._matDialogRef
      .backdropClick()
      .subscribe(() => {
        this._matDialogRef.close({date: this.data['previousSelectedDate']});
    });
  }

  updateCalendarPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
      this.elementPosition = rect.right < 1230;
      if (this.elementPosition) {
          matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 148 }px`, top: `${rect.bottom + 15}px` };
      } else {
          matDialogConfig.position = { left: `${rect.left - 215}px`, top: `${rect.bottom + 15}px` };
      }

      this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  setSearchDate(date) {
    // debugger;
     let _date;
     if (date && !((date[0] as Moment).isSame(this.previousSelectedDate, 'day'))) {
       _date = date[0].toDate();
     } else {
       _date = '';
     }
     console.log(_date);
     this._matDialogRef.close({date: _date});
  }

}
