import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface CalendarDate {
    mDate: moment.Moment;
    disabled?: boolean;
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
    @Input() min: moment.Moment;
    @Input() range: boolean;
    @Input() rangeWeeks: boolean;

    @Output() onSelectDate = new EventEmitter<moment.Moment[]>();

    currentDate = moment();
    dayNames = ['M', 'T', 'W', 'T', 'F'];
    weeks: CalendarDate[][] = [];
    sortedDates: CalendarDate[] = [];

    public hovered: boolean;
    public hoveredDates: moment.Moment[] = [];

    constructor() {}

    ngOnInit(): void {
        if (this.showWeekend) {
            this.dayNames.unshift('S');
            this.dayNames.push('S');
        }
        if (this.min) {
            this.currentDate = this.min;
        }
        this.generateCalendar();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedDates &&
            changes.selectedDates.currentValue &&
            changes.selectedDates.currentValue.length  > 1) {
            this.sortedDates = _.sortBy(changes.selectedDates.currentValue, (m: CalendarDate) => m);
            this.generateCalendar();
        }
    }

    isBeforeMinDate(date: moment.Moment): boolean {
      return moment(date).isBefore(this.min, 'day') && this.showWeekendDay(date);
    }

    isToday(date: moment.Moment): boolean {
        return moment().isSame(moment(date), 'day');
    }

    isSelected(date: moment.Moment): boolean {
        return _.findIndex(this.selectedDates, (selectedDate) => {
            return moment(date).isSame(selectedDate, 'day');
        }) > -1;
    }

    isFirstSelectedDay(date: moment.Moment): boolean {
        return date.isSame(this.selectedDates[0], 'day');
    }

    isLastSelectedDay(date: moment.Moment): boolean {
        return this.selectedDates.length > 1 && date.isSame(this.selectedDates[this.selectedDates.length - 1], 'day');
    }

    isFirstHoveredDay(date: moment.Moment): boolean {
        return date.isSame(this.hoveredDates[0], 'day');
    }

    isLastHoveredDay(date: moment.Moment): boolean {
        return this.hoveredDates.length > 1 && date.isSame(this.hoveredDates[this.hoveredDates.length - 1], 'day');
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

    isNextMonth(date: moment.Moment): boolean {
        return moment(date).month() === moment(this.currentDate).month() + 1;
    }

    isRangeHovered(date: moment.Moment): boolean {
        return (this.range || this.rangeWeeks) && _.findIndex(this.hoveredDates, (hoveredDate) => {
            return moment(date).isSame(hoveredDate, 'day');
        }) > -1;
    }

    hoverDates(date: moment.Moment) {
        this.hovered = true;
        if (this.range && this.selectedDates.length === 1 && !this.hoveredDates.length) {
            const countDiff = date.diff(moment(this.selectedDates[0]), 'days');
            for (let i = 1; i <= countDiff; i++) {
                const hoveredDate = moment(this.selectedDates[0]).add(i, 'days');
                this.hoveredDates.push(hoveredDate);
                this.hoveredDates.push(date);
            }
        } else if (this.rangeWeeks) {
           const start = moment(date).startOf('week');
           for (let i = 1; i <= 5; i++) {
               const hovered = moment(start).add(i, 'days');
               this.hoveredDates.push(hovered);
           }
        }
    }

    disabledHovered() {
        this.hovered = false;
        if ((this.range && this.selectedDates.length === 1) || this.rangeWeeks) {
            this.hoveredDates = [];
        }
    }

    selectDate(date: CalendarDate): void {
        const bulkSelect = this.range;
        const setHour = moment(date.mDate).set('hour', this.currentDate.hour());
        const fullDate = moment(setHour).set('minute', this.currentDate.minutes());
        if (bulkSelect && this.selectedDates.length > 1) {
            this.selectedDates = [fullDate];
        }
        if (bulkSelect && this.selectedDates.length) {
            if (date.mDate.isAfter(moment(this.selectedDates[0]))) {
                const countDiff = date.mDate.diff(moment(this.selectedDates[0]), 'days');
                this.selectedDates.push(date.mDate);
                for (let i = 1; i <= countDiff; i++) {
                    const rangeDates = moment(this.selectedDates[0]).add(i, 'day');
                    if (this.showWeekendDay(rangeDates)) {
                        this.hoveredDates.push(rangeDates);
                    }
                }
            } else {
                this.selectedDates = [fullDate];
                this.hoveredDates = [];
            }
        } else if (this.rangeWeeks) {
            this.selectedDates = [...this.hoveredDates];
            this.onSelectDate.emit([this.selectedDates[0], this.selectedDates[this.selectedDates.length - 1]]);
            this.generateCalendar();
            return;
        } else {
            this.selectedDates = [fullDate];
        }
        this.generateCalendar();
        this.onSelectDate.emit(this.selectedDates);
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

    timePickerResult(date: moment.Moment): void {
        this.currentDate = date;
        this.generateCalendar();
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
                    disabled: this.min ? this.isBeforeMinDate(d) : false,
                    selected: this.isSelected(d),
                    mDate: d,
                };
            });
    }

}
