import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-calendar-toggle',
  templateUrl: './admin-calendar-toggle.component.html',
  styleUrls: ['./admin-calendar-toggle.component.scss']
})
export class AdminCalendarToggleComponent implements OnInit {
  @ViewChild('elem') elem: ElementRef;
  @ViewChild('day') day: ElementRef;
  @ViewChild('dayButton') dayButton: ElementRef;

  @Input() selectedOptions;

  @Input() date;

  @Output() adminCalendarRes: EventEmitter<any> = new EventEmitter<any>();

  public rangeOptions = [
      { id: 'range_0', title: 'Today', selectedIcon: './assets/Check (Navy).svg'},
      { id: 'range_1', title: 'Last 7 Days', selectedIcon: './assets/Check (Navy).svg'},
      { id: 'range_2', title: 'Last 30 Days', selectedIcon: './assets/Check (Navy).svg' },
      { id: 'range_3', title: 'Last 90 Days', selectedIcon: './assets/Check (Navy).svg' },
      { id: 'range_4', title: 'Custom Date Range', selectedIcon: './assets/Check (Navy).svg', arrowIcon: './assets/Chevron Right (Navy).svg'}
  ];

  public daysOptions = [
      {id: 'days_1', title: 'All Day', selectedIcon: './assets/Check (Navy).svg'},
      {id: 'days_2', title: 'Custom Time Range', selectedIcon: './assets/Check (Navy).svg', arrowIcon: './assets/Chevron Right (Navy).svg'},
  ];
  public openCalendar: boolean;
  public openTimeRange: boolean;

  public toggleResult: string;

  public selectedRangeId: string;

  public currentDate: moment.Moment = moment();
  public selectedDate: {
    start: moment.Moment;
    end: moment.Moment
  } = {start: null, end: null};

  public selectedDay: moment.Moment;

  constructor(private cdr: ChangeDetectorRef) { }

  get selectedDateText() {
    return this.selectedDate.start && this.selectedDate.end &&
        this.selectedDate.start.format('MMM D') + ' to ' + this.selectedDate.end.format('MMM D');
  }

  ngOnInit() {
    console.log(this.selectedOptions);
    if (this.selectedOptions) {
      setTimeout(() => {
          this.toggleResult = this.selectedOptions.toggleResult;
          // this.selectedDate = this.selectedOptions.date;
          if (this.selectedOptions.rangeId) {
            this.selectedRangeId = this.selectedOptions.rangeId;
          }
          if (this.date) {
            if (this.toggleResult === 'Range') {
              this.selectedDate = this.date;
            } else if (this.toggleResult === 'Days') {
              this.selectedDay = this.selectedDate.start;
            }
          }
      }, 10);
    }
  }

  selectedRangeOption(id) {
    this.openCalendar = false;
    this.selectedDate.end = this.currentDate;
    if (id === 'range_0') {
      this.selectedDate.start = this.currentDate;
    } else if (id === 'range_1') {
      this.selectedDate.start = moment().subtract(7, 'days');
    } else if (id === 'range_2') {
        this.selectedDate.start = moment().subtract(30, 'days');
    } else if (id === 'range_3') {
        this.selectedDate.start = moment().subtract(90, 'days');
    } else if (id === 'range_4') {
      this.openCalendar = true;
      // this.selectedDate = { start: null, end: null };
        console.log('DAte ==>>', this.selectedDate);
        return false;
    }
    this.adminCalendarRes.emit({date: this.selectedDate, options: { toggleResult: this.toggleResult, rangeId: id }});
  }

  selectedDaysOption(id) {
      this.openTimeRange = id === 'days_2';
      if (this.openTimeRange) {
          this.cdr.detectChanges();
          this.day.nativeElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
      }
  }

  calendarResult(selectedDates) {
    if (this.toggleResult === 'Range') {
        this.selectedDate.start = selectedDates[0];
        this.selectedDate.end = selectedDates[1];
        this.cdr.detectChanges();
        if (this.selectedDate.start && this.selectedDate.end) {
            this.elem.nativeElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
        }
    } else if (this.toggleResult === 'Days') {
      this.selectedDay = selectedDates[0];
      if (this.openTimeRange) {
         this.selectedDate.start = moment(this.selectedDate.start)
            .set('month', this.selectedDay.month())
            .set('year', this.selectedDay.year())
            .set('date', this.selectedDay.date());
        this.selectedDate.end = moment(this.selectedDate.end)
            .set('month', this.selectedDay.month())
            .set('year', this.selectedDay.year())
            .set('date', this.selectedDay.date());
          this.cdr.detectChanges();
          this.dayButton.nativeElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
      } else {
        this.adminCalendarRes.emit({date: this.selectedDay, options: {toggleResult: this.toggleResult}});
      }
    } else if (this.toggleResult === 'Weeks') {
      this.adminCalendarRes.emit({date: {start: selectedDates[0], end: selectedDates[1]}, options: {toggleResult: this.toggleResult}});
    }
  }

  resetDate() {
      this.selectedDate = { start: null, end: null };
  }

  save() {
    this.adminCalendarRes.emit({date: this.selectedDate, options: {toggleResult: this.toggleResult}});
  }

}
