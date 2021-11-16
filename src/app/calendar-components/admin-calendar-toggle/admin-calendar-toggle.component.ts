import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-admin-calendar-toggle',
  templateUrl: './admin-calendar-toggle.component.html',
  styleUrls: ['./admin-calendar-toggle.component.scss']
})
export class AdminCalendarToggleComponent implements OnInit, OnDestroy {
  @ViewChild('elem') elem: ElementRef;
  @ViewChild('day') day: ElementRef;
  @ViewChild('dayButton') dayButton: ElementRef;
  @ViewChild('rangeButton') rangeButton: ElementRef;
  @ViewChild('container', { static: true }) set content(content: ElementRef) {
    if (content) {
      setTimeout(() => {
        this.container = content.nativeElement;
        const rect = this.container.getBoundingClientRect();
        // this.containerInitialHeight = this.containerInitialHeight ? this.containerInitialHeight : rect.height;
        this.windowInnerHeight = window.innerHeight;

        if ((window.innerHeight) < rect.top + rect.height) {
          this.container.style.height = window.innerHeight - rect.top - 5 + 'px';
        }
      }, 300);


    }
  };

  @Input() selectedOptions;

  @Input() date;

  @Output() settingsRes: EventEmitter<any> = new EventEmitter<any>();
  @Output() adminCalendarRes: EventEmitter<any> = new EventEmitter<any>();

  public container: HTMLElement;
  public containerInitialHeight: number = 345;
  public windowInnerHeight: number;

  public rangeOptions = [
      { id: 'range_0', title: 'Today', selectedIcon: './assets/Check (Navy).svg'},
      { id: 'range_5', title: 'Last 3 Days', selectedIcon: './assets/Check (Navy).svg'},
      { id: 'range_1', title: 'Last 7 Days', selectedIcon: './assets/Check (Navy).svg'},
      { id: 'range_2', title: 'Last 30 Days', selectedIcon: './assets/Check (Navy).svg' },
      { id: 'range_3', title: 'Last 90 Days', selectedIcon: './assets/Check (Navy).svg' },
      { id: 'range_6', title: 'This school year', selectedIcon: './assets/Check (Navy).svg'},
      { id: 'range_4', title: 'Custom Date Range', selectedIcon: './assets/Check (Navy).svg', arrowIcon: './assets/Chevron Down (Blue-Gray).svg'}
  ];

  public daysOptions = [
      {id: 'days_1', title: 'All Day', selectedIcon: './assets/Check (Navy).svg'},
      {id: 'days_2', title: 'Custom Time Range', selectedIcon: './assets/Check (Navy).svg', arrowIcon: './assets/Chevron Down (Blue-Gray).svg'},
  ];
  public openCalendar: boolean;
  public openTimeRange: boolean;

  public toggleResult: string;

  public selectedRangeId: string;
  public selectedDayId: string;

  public exportDates: moment.Moment[] = [];
  public exportDate = [];
  public exportHoveredDates: moment.Moment[] = [];

  public currentDate: moment.Moment = moment();
  public selectedDate: {
    start: moment.Moment;
    end: moment.Moment
  } = {start: null, end: null};

  public selectedDay: moment.Moment;

  destroy$ = new Subject();

  constructor(private cdr: ChangeDetectorRef) { }

  get rangeDate() {
    return this.rangeOptions.find(opt => opt.id === 'range_4');
  }

  ngOnInit() {
    // console.log(this.selectedOptions);
    if (this.selectedOptions) {
      setTimeout(() => {
          this.toggleResult = this.selectedOptions.toggleResult;
          if (this.selectedOptions.rangeId) {
            this.selectedRangeId = this.selectedOptions.rangeId;
          }
          if (this.date) {
            if (this.toggleResult === 'Range') {
              this.selectedDate = this.date;
              if (this.selectedRangeId === 'range_4') {
                  this.openCalendar = true;
                  this.exportDates = [this.selectedDate.start, this.selectedDate.end];
                  const countDiff = this.selectedDate.end.diff(moment(this.selectedDate.start), 'days');
                  for (let i = 0; i <= countDiff; i++) {
                      const hoveredDate = moment(this.selectedDate.start).add(i, 'days');
                      this.exportHoveredDates.push(hoveredDate);
                      this.exportHoveredDates.push(this.selectedDate.end);
                  }
                  this.cdr.detectChanges();
                  if (this.selectedDate.start && this.selectedDate.end) {
                      this.elem.nativeElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
                  }
              }
            } else if (this.toggleResult === 'Days') {
              this.selectedDayId = this.selectedOptions.dayOptId;
              this.exportDate = [this.date.start];
              this.selectedDay = this.date.start;
              this.selectedDate = this.date;
              if (this.selectedOptions.dayOptId === 'days_2') {
                  this.selectedDaysOption('days_2');
              }
            } else if (this.toggleResult === 'Weeks') {
                this.selectedDate = this.date;
                const countDiff = this.selectedDate.end.diff(moment(this.selectedDate.start), 'days');
                for (let i = 0; i <= countDiff; i++) {
                    const hoveredDate = moment(this.selectedDate.start).add(i, 'days');
                    this.exportHoveredDates.push(hoveredDate);
                    this.exportHoveredDates.push(this.selectedDate.end);
                }
            }
          }
      }, 10);
    }

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const rect = this.container.getBoundingClientRect();
        const direction = this.windowInnerHeight > window.innerHeight ? 'up' : 'down';
        let h;

        if (this.openCalendar &&  this.toggleResult === 'Range') {
          h = 451;
        } else if (this.toggleResult === 'Weeks') {
          h = 370;
        } else if (this.toggleResult === 'Days') {
          h = 479;
        } else {
          h = this.containerInitialHeight;
        }

        if ((window.innerHeight) < rect.top + rect.height) {
          this.container.style.height = window.innerHeight - rect.top - 5 + 'px';
        } else if (window.innerHeight > (rect.top + rect.height) && (rect.height + 5) < h) {
          this.container.style.height = ((window.innerHeight - rect.top - 5) < h ? (window.innerHeight - rect.top - 5) : h) + 'px';
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectedRangeOption(id) {
    this.openCalendar = false;
    if (id === 'range_0') {
      this.selectedDate.end = this.currentDate;
      this.selectedDate.start = moment(this.currentDate).startOf('day');
    } else if (id === 'range_1') {
      this.selectedDate.end = this.currentDate;
      this.selectedDate.start = moment().subtract(7, 'days').startOf('day');
    } else if (id === 'range_2') {
      this.selectedDate.end = this.currentDate;
      this.selectedDate.start = moment().subtract(30, 'days').startOf('day');
    } else if (id === 'range_3') {
      this.selectedDate.end = this.currentDate;
      this.selectedDate.start = moment().subtract(90, 'days').startOf('day');
    } else if (id === 'range_4') {
      this.openCalendar = true;
      this.settingsRes.emit({ toggleResult: this.toggleResult, rangeId: id });
      // this.selectedDate = { start: null, end: null };
      setTimeout(() => {
        this.rangeButton.nativeElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
      }, 100);
        return false;
    } else if (id === 'range_5') {
      this.selectedDate.end = this.currentDate;
      this.selectedDate.start = moment().subtract(3, 'days').startOf('day');
    } else if (id === 'range_6') {
      this.selectedDate.start = moment('1/8/' + this.currentDate.year(), 'DD/MM/YYYY');
      this.selectedDate.end = moment('31/7/' + moment(this.currentDate).add(1, 'year').year(), 'DD/MM/YYYY');
    }
    this.settingsRes.emit({ toggleResult: this.toggleResult, rangeId: id });
    this.adminCalendarRes.emit(this.selectedDate);
  }

  selectedDaysOption(id) {
    // debugger;
      this.openTimeRange = id === 'days_2';
      if (this.openTimeRange) {
          this.settingsRes.emit({toggleResult: this.toggleResult, dayOptId: id});
          this.cdr.detectChanges();
          setTimeout(() => {
            this.dayButton.nativeElement.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
          }, 100);
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
          this.settingsRes.emit({toggleResult: this.toggleResult});
          this.adminCalendarRes.emit({start: moment(this.selectedDay).startOf('day'), end: moment(this.selectedDay)});
      }
    } else if (this.toggleResult === 'Weeks') {
        this.settingsRes.emit({toggleResult: this.toggleResult});
        this.adminCalendarRes.emit({start: selectedDates[0], end: selectedDates[1]});
    }
  }

  resetDate() {
      this.selectedDate = { start: null, end: null };
  }

  changeRangeTime(start, date) {
    if (start) {
      this.selectedDate.start = date;
    } else {
      this.selectedDate.end = date;
    }
  }

  save() {
    this.settingsRes.emit({toggleResult: this.toggleResult});
    this.adminCalendarRes.emit(this.selectedDate);
  }

}
