import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TimeService } from '../../services/time.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  triggerElementRef: ElementRef;
  previousSelectedDate: Date;
  minDate: Date = new Date('December 17, 1995 03:24:00');
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
  ) {
    // if (this.default === undefined) {
    //   this.default = this.timeService.nowDate();
    // }
  }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.previousSelectedDate = this.data['previousSelectedDate'];
    this.updateCalendarPosition();
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
     let _date;
     if (date) {
       _date = date;
     } else {
       _date = '';
     }
     console.log(_date);
     this._matDialogRef.close({date: _date});
  }

}
