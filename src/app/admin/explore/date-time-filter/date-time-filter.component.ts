import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-date-time-filter',
  templateUrl: './date-time-filter.component.html',
  styleUrls: ['./date-time-filter.component.scss']
})
export class DateTimeFilterComponent implements OnInit {

  targetElementRef: ElementRef;

  calendarOptions;

  selectedDate;

  options: any = {};

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any[],
      private _matDialogRef: MatDialogRef<DateTimeFilterComponent>,
  ) { }

  ngOnInit() {
    this.targetElementRef = this.data['target'];
    this.calendarOptions = this.data['options'];
    this.selectedDate = this.data['date'];
    this.updateCalendarPosition();

    // fromEvent(window, 'resize').subscribe(() => {
    //     const  selfRect = (this.selfRef.nativeElement as HTMLElement).getBoundingClientRect();
    //
    //     if (window.document.body.clientHeight < (selfRect.top + selfRect.height)) {
    //         // this.selfRef.nativeElement.style.height = selfRect.height - 50 + 'px';
    //     }
    // });
  }

  updateCalendarPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();

      matDialogConfig.position = { left: `${rect.left - 100}px`, top: `${rect.bottom + 15}px` };

      this._matDialogRef.updatePosition(matDialogConfig.position);
  }

  saveOptions(options) {
      this.options.toggleResult = options.toggleResult;
      if (options.rangeId) {
          this.options.rangeId = options.rangeId;
      }
      if (options.dayOptId) {
          this.options.dayOptId = options.dayOptId;
      }
  }

  calendarResult(dates) {
      this._matDialogRef.close({ date: dates, options: this.options });
  }

}
