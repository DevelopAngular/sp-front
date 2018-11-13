import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material';
//import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { HallDateTimePickerComponent } from '../hall-date-time-picker/hall-date-time-picker.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Util } from '../../Util';


@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit {

    @Input() input_type: string = "text";
    @Input() input_class: string;
    @Input() input_value: string = "";
    @Input() Success: boolean;
    @Input() input_label: string;
    @Output() onUpdate = new EventEmitter<string>();
    @Input() IsRequired: boolean = false;
    @Input() IsDate: boolean = false;

    input_DateRange: string;

    @ViewChild('appInput') input: ElementRef;

    showDates: boolean = false;

    min: Date = new Date('December 17, 1995 03:24:00');
    searchDate_From$ = new BehaviorSubject<Date>(null);
    searchDate_To$ = new BehaviorSubject<Date>(null);

    @Output() onUpdateDateRange: EventEmitter<string> = new EventEmitter();

    constructor(public dialog: MatDialog) {
        this.setSearchDate_From(new Date());
        this.setSearchDate_To(new Date());
    }

    ngOnInit() {
        if (this.IsRequired)
            this.Success = false;
  }

  ChangeStatus(status) {
      this.Success = status;
  }

  UpdateInputValue()
  {
      this.input_value = this.input.nativeElement.value;
      this.onUpdate.emit(this.input_value);
  }

  OpenDatePicker()
  {
      if (this.IsDate)
      {
          this.dialog.open(HallDateTimePickerComponent, {
              width: '750px',
              panelClass: 'form-dialog-container',
              backdropClass: 'custom-backdrop',
              data: { 'forLater': true, 'forStaff': true }
          });

          this.showDates = !this.showDates;

      }
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

  DateRangeClick()
  {
      this.showDates = !this.showDates;
      this.input.nativeElement.value = Util.formatDateTimeForDateRange(this.searchDate_From, this.searchDate_To);
      this.onUpdateDateRange.emit(Util.formatDateTimeForDateRange(this.searchDate_From, this.searchDate_To));
  }
}
