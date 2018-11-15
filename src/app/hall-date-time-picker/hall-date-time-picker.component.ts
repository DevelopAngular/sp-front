import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Util } from '../../Util';

@Component({
  selector: 'app-hall-date-time-picker',
  templateUrl: './hall-date-time-picker.component.html',
  styleUrls: ['./hall-date-time-picker.component.scss']
})

export class HallDateTimePickerComponent implements OnInit {

    input_DateRange: string;

    min: Date = new Date('December 17, 1995 03:24:00');
    searchDate_From$ = new BehaviorSubject<Date>(null);
    searchDate_To$ = new BehaviorSubject<Date>(null);

    @Output() onUpdateDateRange: EventEmitter<string> = new EventEmitter();

    constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<HallDateTimePickerComponent>) {
        this.setSearchDate_From(new Date());
        this.setSearchDate_To(new Date());
    }

  ngOnInit() {
  }

  setSearchDate_From(date: Date) {
      if (date != null || date != undefined) {
          this.searchDate_From$.next(date);
      }
  }
  get searchDate_From() {
      return this.searchDate_From$.value;
  }

  setSearchDate_To(date: Date) {
      if (date != null || date != undefined) {
          this.searchDate_To$.next(date);
      }
  }
  get searchDate_To() {
      return this.searchDate_To$.value;
  }

  get getDisplayRange() {

      return Util.formatDateTimeForDateRange(this.searchDate_From, this.searchDate_To);
      //return this.searchDate_1st;
  }

  DateRangeClick() {      
      this.onUpdateDateRange.emit(Util.formatDateTimeForDateRange(this.searchDate_From, this.searchDate_To));
      this.input_DateRange = Util.formatDateTimeForDateRange(this.searchDate_From, this.searchDate_To);
      //this.dialog.closeAll();
      this.dialogRef.close({
          'input_DateRange': this.input_DateRange
      });
  }

  back() {
      
          this.dialogRef.close();
          return false;
  }

}
