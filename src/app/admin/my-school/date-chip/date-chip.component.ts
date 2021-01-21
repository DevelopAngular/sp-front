import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../../../animations';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {CalendarComponent} from '../../calendar/calendar.component';
import * as moment from 'moment';
import {MatDialog} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-date-chip',
  templateUrl: './date-chip.component.html',
  styleUrls: ['./date-chip.component.scss'],
  animations: [bumpIn]
})
export class DateChipComponent implements OnInit {

  @Input() selectedDate: moment.Moment = moment();
  @Input() disabled: boolean;

  @Output() dateEmit: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

  buttonDown: boolean;

  constructor(
    public darkTheme: DarkThemeSwitch,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openCalendar(event) {
    if (!this.disabled) {
      const target = new ElementRef(event.currentTarget);
      const DR = this.dialog.open(CalendarComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          trigger: target,
          previousSelectedDate: this.selectedDate,
          minDate: moment()
        }
      });

      DR.afterClosed().pipe(filter(date => date.date !== undefined && date.date !== null))
        .subscribe(res => {
        this.selectedDate = res.date === '' ? moment() : moment(res.date);
        this.dateEmit.emit(this.selectedDate);
      });
    }
  }

}
