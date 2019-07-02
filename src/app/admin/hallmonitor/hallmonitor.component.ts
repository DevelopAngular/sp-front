import {Component, OnInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import { MatDialog } from '@angular/material';
import {BehaviorSubject, fromEvent, combineLatest, Observable, of, Subject} from 'rxjs';
import { User } from '../../models/User';
import { Report } from '../../models/Report';
import { Pinnable } from '../../models/Pinnable';
import { ActivePassProvider } from '../../hall-monitor/hall-monitor.component';
import { LiveDataService } from '../../live-data/live-data.service';
import {WrappedProvider} from '../../models/providers';
import { TimeService } from '../../services/time.service';
import {CalendarComponent} from '../calendar/calendar.component';
import {HttpService} from '../../services/http-service';
import {Util} from '../../../Util';
import {delay, filter, map, switchMap, tap, toArray} from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import * as _ from 'lodash';



@Component({
  selector: 'app-hallmonitor',
  templateUrl: './hallmonitor.component.html',
  styleUrls: ['./hallmonitor.component.scss']
})
export class HallmonitorComponent implements OnInit {

    @ViewChild('bottomShadow') bottomShadow;
    @ViewChild('reportBox') reportBox: ElementRef;

    activePassProvider: WrappedProvider;
    searchQuery$ = new BehaviorSubject('');
    minDate: Date;
    activeCalendar: boolean;
    choices = ['Origin', 'Destination', 'Both'];

    rooms: Pinnable[];

    selectedStudents: User[] = [];
    studentreport: Report[] | any[] = [];
    pending: boolean = true;
    searchPending$: Subject<boolean> = new Subject<boolean>();

    min: Date = new Date('December 17, 1995 03:24:00');

    passesLoaded: Observable<boolean> = of(false);

    hasPasses: Observable<boolean> = of(false);

    inactiveIcon: boolean = true;

    reportsLimit: number = 10;
    counter: number = 0;

    public reportsDate: Date;

    @HostListener('scroll', ['$event'])
    onScroll(event) {
        const tracker = event.target;
        const limit = tracker.scrollHeight - tracker.clientHeight;
        if (event.target.scrollTop === limit && !this.pending && (this.reportsLimit === this.counter)) {
            this.reportsLimit += 10;
                this.getReports();
        }
    }

    constructor(
        public dialog: MatDialog,
        private liveDataService: LiveDataService,
        private http: HttpService,
        private adminService: AdminService,
        private elRef: ElementRef,
        private timeService: TimeService,
        public darkTheme: DarkThemeSwitch

    ) {
      this.activePassProvider = new WrappedProvider(new ActivePassProvider(this.liveDataService, this.searchQuery$));
      this.minDate = this.timeService.nowDate();
    }
  get calendarIcon() {
    if (this.inactiveIcon) {
      return this.darkTheme.getIcon({
        iconName: 'Calendar',
        lightFill: 'Navy',
        darkFill: 'White',
      });


    } else {
      return './assets/Calendar (Blue).svg';
    }
  }

  ngOnInit() {
    this.http.globalReload$.subscribe(() => {
      this.getReports();
    });
    // this.activePassProvider.loaded$
    //   .pipe(
    //     filter(v => v),
    //   )
    //   .subscribe((res) => {
    //     this.searchPending$.next(!res);
    //     console.log(res);
    //   });
    this.hasPasses = this.activePassProvider.length$.asObservable().pipe(map(l => l > 0));

    this.passesLoaded = this.activePassProvider.loaded$.pipe(
      filter(v => v),
      delay(250),
      tap((res) => this.searchPending$.next(!res))
    );
  }

  onSearch(searchValue) {
      console.log('It emits here!', searchValue);
    this.searchPending$.next(true);
     this.searchQuery$.next(searchValue);
  }



  openDateDialog(event) {
    this.activeCalendar = true;
    const target = new ElementRef(event.currentTarget);
    const DR = this.dialog.open(CalendarComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': target,
          'previousSelectedDate': this.reportsDate ? new Date(this.reportsDate) : null,
        }
    });
    DR.afterClosed()
      .subscribe((data) => {
        this.activeCalendar = false;

      // console.log('82 Date ===> :', data.date);
        if (data.date) {
          this.inactiveIcon = data.date.getDay() === new Date().getDay();
          if ( !this.reportsDate || (this.reportsDate && this.reportsDate.getTime() !== data.date.getTime()) ) {
            this.reportsDate = new Date(data.date);
            this.getReports(this.reportsDate);
          }
        } else {
          this.reportsDate = null;
          this.getReports(null, true);
        }
      }
    );
  }

  private getReports(date?: Date, afterCalendar = false) {
    this.pending = true;
    // this.studentreport = [];
    const range = this.liveDataService.getDateRange(date);
    const response$ = date ?
        this.adminService.searchReports(range.end.toISOString(), range.start.toISOString()) :
        this.adminService.getReports(this.reportsLimit);
    response$.pipe(
        map((list: any) => {
          const data  = date ? list : list.results;
            this.counter = data.length;
          return data.map((report, index) => {
            return {
              student_name: report.student.display_name + ` (${report.student.primary_email.split('@', 1)[0]})`,
              issuer: report.issuer.display_name,
              createdDate: Util.formatDateTime(new Date(report.created), false, false).split(', ')[0],
              created: Util.formatDateTime(new Date(report.created), false, false),
              message: report.message,
            };
          });

        }),
        switchMap((list: any[]) => {
          const groupedStudentreport: any[] = [];
          const temp = {
            date: null,
            reports: []
          };
          list.forEach((report, index) => {

            if (index < list.length) {
              temp.date = report.createdDate;
              temp.reports.push(report);

              if ( (index === list.length - 1) || report.createdDate !== list[index + 1].createdDate)  {
                groupedStudentreport.push(Object.assign({}, temp));
                temp.date = '';
                temp.reports = [];
                return;
              }
            }
          });
          return groupedStudentreport;
        }),
        toArray()
      )
      .subscribe((list: any[]) => {
        this.pending = false;
        if (date || afterCalendar) {
            this.studentreport = list;
        } else {
            this.studentreport.push(..._.takeRight(list, 10));
        }
      });
  }
}
