import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-calendar-toggle',
  templateUrl: './admin-calendar-toggle.component.html',
  styleUrls: ['./admin-calendar-toggle.component.scss']
})
export class AdminCalendarToggleComponent implements OnInit {

  @Output() adminCalendarRes: EventEmitter<any> = new EventEmitter<any>();

  public rangeOptions = [
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

  public currentDate: moment.Moment = moment();
  public selectedDate: {
    start: moment.Moment;
    end: moment.Moment
  } = {start: null, end: null};

  public selectedDay: moment.Moment;

  constructor() { }

  get selectedDateText() {
    return this.selectedDate.start && this.selectedDate.end &&
        this.selectedDate.start.format('MMM D') + ' to ' + this.selectedDate.end.format('MMM D');
  }

  ngOnInit() {
  }

  selectedRangeOption(id) {
    this.openCalendar = false;
    this.selectedDate.start = this.currentDate;
    if (id === 'range_1') {
      this.selectedDate.end = moment().add(7, 'days');
    } else if (id === 'range_2') {
        this.selectedDate.end = moment().add(30, 'days');
    } else if (id === 'range_3') {
        this.selectedDate.end = moment().add(90, 'days');
    } else if (id === 'range_4') {
      this.openCalendar = true;
      this.selectedDate = { start: null, end: null };
      return false;
    }
    this.adminCalendarRes.emit(this.selectedDate);
  }

  selectedDaysOption(id) {
      this.openTimeRange = id === 'days_2';
  }

  calendarResult(selectedDates) {
    if (this.toggleResult === 'Range') {
        this.selectedDate.start = selectedDates[0];
        this.selectedDate.end = selectedDates[1];
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
      } else {
        this.adminCalendarRes.emit(this.selectedDay);
      }
    } else if (this.toggleResult === 'Weeks') {
      this.adminCalendarRes.emit({start: selectedDates[0], end: selectedDates[1]});
    }
  }

  resetDate() {
      this.selectedDate = { start: null, end: null };
  }

  save() {
    console.log(this.selectedDate);
  }

}
