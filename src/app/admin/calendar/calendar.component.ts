import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  triggerElementRef: HTMLElement;
  previousSelectedDate: moment.Moment;
  default: Date;
  elementPosition;
  minDate: moment.Moment;
  passDates: Map<string, number>;

  @HostListener('window:resize', ['$event.target'])
    onResize() {
      this.updateCalendarPosition();
    }

  constructor(
  @Inject(MAT_DIALOG_DATA) public data: any[],
      private _matDialogRef: MatDialogRef<CalendarComponent>,
  ) {}

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    if (this.data['previousSelectedDate']) {
      this.previousSelectedDate = moment(this.data['previousSelectedDate']);
    }
    if (this.data['dotsDates']) {
      this.passDates = this.data['dotsDates'];
    }
    if (this.data['minDate']) {
      this.minDate = this.data['minDate'];
    }
    this.updateCalendarPosition();
    this._matDialogRef
      .backdropClick()
      .subscribe(() => {
        this._matDialogRef.close({date: this.data['previousSelectedDate']});
    });
  }

  updateCalendarPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef.getBoundingClientRect();
      this.elementPosition = rect.right < 1230;
      if (this.elementPosition) {
          matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 148 }px`, top: `${rect.bottom + 15}px` };
      } else {
          matDialogConfig.position = { left: `${rect.left - 215}px`, top: `${rect.bottom + 15}px` };
      }

      this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  setSearchDate(date) {
     let _date;
     if (date && !((date[0] as Moment).isSame(this.previousSelectedDate, 'day'))) {
       _date = date[0].toDate();
     } else {
       _date = '';
     }
     this._matDialogRef.close({date: _date});
  }

}
