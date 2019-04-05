import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface CalendarDate {
    mDate: moment.Moment;
    selected?: boolean;
    today?: boolean;
}

@Component({
  selector: 'app-calendar-picker',
  templateUrl: './calendar-picker.component.html',
  styleUrls: ['./calendar-picker.component.scss']
})
export class CalendarPickerComponent implements OnInit, OnChanges {

    @Input() selectedDates: moment.Moment[] = [];
    @Input() width: number = 270;
    @Input() showWeekend: boolean;
    @Input() showTime: boolean = true;
    @Input() min: moment.Moment = moment('2019-04-07',       'YYYY-MM-DD HH:mm');
    @Input() max: moment.Moment;

    @Output() onSelectDate = new EventEmitter<moment.Moment>();

    currentDate = moment();
    dayNames = ['M', 'T', 'W', 'T', 'F'];
    weeks: CalendarDate[][] = [];
    sortedDates: CalendarDate[] = [];
    resultTimePicker: moment.Moment;

    minDate: boolean;

    public hovered: boolean;

    constructor() {}

    ngOnInit(): void {
        if (this.showWeekend) {
            this.dayNames.unshift('S');
            this.dayNames.push('S');
        }
        this.generateCalendar();
        // this.getMinDate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedDates &&
            changes.selectedDates.currentValue &&
            changes.selectedDates.currentValue.length  > 1) {
            this.sortedDates = _.sortBy(changes.selectedDates.currentValue, (m: CalendarDate) => m.mDate.valueOf());
            this.generateCalendar();
        }
    }

    // getMinDate() {
    //     this.minDate = this.currentDate.isAfter(this.min);
    // }

    isToday(date: moment.Moment): boolean {
        return moment().isSame(moment(date), 'day');
    }

    isSelected(date: moment.Moment): boolean {
        return _.findIndex(this.selectedDates, (selectedDate) => {
            return moment(date).isSame(selectedDate, 'day');
        }) > -1;
    }

    showWeekendDay(date: moment.Moment): boolean {
        if (!this.showWeekend) {
           return moment(date).isoWeekday() !== 6 && moment(date).isoWeekday() !== 7;
        } else {
            return true;
        }
    }

    isSelectedMonth(date: moment.Moment): boolean {
        return moment(date).isSame(this.currentDate, 'month');
    }

    isNextMonth(date: moment.Moment) {
        return moment(date).month() === moment(this.currentDate).month() + 1;
    }

    selectDate(date: CalendarDate): void {
        const setHour = moment(date.mDate).set('hour', moment().hour());
        const fullDate = moment(setHour).set('minute', moment().minutes());
        this.selectedDates = [fullDate];
        this.onSelectDate.emit(fullDate);
        console.log(fullDate.format('MM-DD-YYYY / HH : mm'));
    }

    prevMonth(): void {
        this.currentDate = moment(this.currentDate).subtract(1, 'months');
        this.generateCalendar();
    }

    nextMonth(): void {
        this.currentDate = moment(this.currentDate).add(1, 'months');
        this.generateCalendar();
    }

    firstMonth(): void {
        this.currentDate = moment(this.currentDate).startOf('year');
        this.generateCalendar();
    }

    lastMonth(): void {
        this.currentDate = moment(this.currentDate).endOf('year');
        this.generateCalendar();
    }

    prevYear(): void {
        this.currentDate = moment(this.currentDate).subtract(1, 'year');
        this.generateCalendar();
    }

    nextYear(): void {
        this.currentDate = moment(this.currentDate).add(1, 'year');
        this.generateCalendar();
    }

    timePickerResult(date: moment.Moment) {
        this.resultTimePicker = date;
        console.log(moment(date).format('MM-DD-YYYY / HH : mm'));
    }

    generateCalendar(): void {
        const dates = this.fillDates(this.currentDate);
        const weeks: CalendarDate[][] = [];
        while (dates.length > 0) {
            weeks.push(dates.splice(0, 7));
        }
        this.weeks = weeks;
    }

    fillDates(currentMoment: moment.Moment): CalendarDate[] {
        const firstOfMonth = moment(currentMoment).startOf('month').day();
        const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
        const start = firstDayOfGrid.date();
        return _.range(start, start + 42)
            .map((date: number): CalendarDate => {
                const d = moment(firstDayOfGrid).date(date);
                return {
                    today: this.isToday(d),
                    selected: this.isSelected(d),
                    mDate: d,
                };
            });
    }

}
