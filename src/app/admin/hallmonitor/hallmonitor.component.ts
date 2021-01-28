import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject, interval, merge, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {User} from '../../models/User';
import {Report} from '../../models/Report';
import {Pinnable} from '../../models/Pinnable';
import {HallPassFilter, LiveDataService} from '../../live-data/live-data.service';
import {TimeService} from '../../services/time.service';
import {CalendarComponent} from '../calendar/calendar.component';
import {HttpService} from '../../services/http-service';
import {Util} from '../../../Util';
import {delay, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {ScrollPositionService} from '../../scroll-position.service';
import {takeRight} from 'lodash';
import * as moment from 'moment';
import {School} from '../../models/School';
import {mergeObject} from '../../live-data/helpers';


@Component({
  selector: 'app-hallmonitor',
  templateUrl: './hallmonitor.component.html',
  styleUrls: ['./hallmonitor.component.scss']
})
export class HallmonitorComponent implements OnInit, OnDestroy {

    private scrollableAreaName = 'HallMonitorAdmin';
    private scrollableArea: HTMLElement;

    @ViewChild('scrollableArea', { static: true }) set scrollable(scrollable: ElementRef) {
      if (scrollable) {
        this.scrollableArea = scrollable.nativeElement;

        const updatePosition = function () {

          const scrollObserver = new Subject();
          const initialHeight = this.scrollableArea.scrollHeight;
          const scrollOffset = this.scrollPosition.getComponentScroll(this.scrollableAreaName);

          /**
           * If the scrollable area has static height, call `scrollTo` immediately,
           * otherwise additional subscription will perform once if the height changes
           */

          if (scrollOffset) {
            this.scrollableArea.scrollTo({top: scrollOffset});
          }

          interval(50)
            .pipe(
              filter(() => {
                return initialHeight < ((scrollable.nativeElement as HTMLElement).scrollHeight) && scrollOffset;
              }),
              takeUntil(scrollObserver)
            )
            .subscribe((v) => {
              // console.log(scrollOffset);
              if (v) {
                this.scrollableArea.scrollTo({top: scrollOffset});
                scrollObserver.next();
                scrollObserver.complete();
                updatePosition();
              }
            });
        }.bind(this);
        updatePosition();
      }
    }

    @ViewChild('bottomShadow', { static: true }) bottomShadow;
    @ViewChild('reportBox', { static: true }) reportBox: ElementRef;

    activePassProvider: any;
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
    isSupplementReports: boolean;

    reportsLimit: number = 10;
    counter: number = 0;

    public reportsDate: Date;
    currentSchool: School;

    changeReports$ = new Subject();
  sortMode: string = '';

    @HostListener('scroll', ['$event'])
    onScroll(event) {
        const tracker = event.target;
        const limit = tracker.scrollHeight - tracker.clientHeight;
        if (event.target.scrollTop === limit && !this.pending && (this.reportsLimit === this.counter)) {
            this.reportsLimit += 10;
            this.isSupplementReports = true;
                this.changeReports$.next();
        }
    }

    constructor(
        public dialog: MatDialog,
        private liveDataService: LiveDataService,
        private http: HttpService,
        public adminService: AdminService,
        private elRef: ElementRef,
        private timeService: TimeService,
        public darkTheme: DarkThemeSwitch,
        private scrollPosition: ScrollPositionService

    ) {
      this.liveDataService.getHallMonitorPassesRequest(of({sort: '-created', search_query: ''}));
      this.activePassProvider = this.liveDataService.hallMonitorPasses$;
      this.minDate = this.timeService.nowDate();
      this.currentSchool = this.http.getSchool();
    }

  ngOnInit() {
      merge(this.http.globalReload$, this.changeReports$)
        .pipe(
          switchMap(() => {
           return this.getReports(this.reportsDate);
        }))
        .subscribe((list: any[]) => {
          this.pending = false;
          if (!this.isSupplementReports) {
            this.studentreport = list;
          } else {
            this.studentreport.push(...takeRight(list, 10));
            this.isSupplementReports = false;
          }
        });

    this.hasPasses = this.liveDataService.hallMonitorPassesTotalNumber$.pipe(map(l => l > 0));

    this.passesLoaded = this.liveDataService.hallMonitorPassesLoaded$.pipe(
      filter(v => v),
      delay(250),
      tap((res) => this.searchPending$.next(!res))
    );
  }

  onSearch(searchValue) {
    this.searchPending$.next(true);
     this.searchQuery$.next(searchValue);
     this.updatePassCollection(this.sortMode);
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
        if (data.date) {
          this.inactiveIcon = data.date.getDay() === new Date().getDay();
          if ( !this.reportsDate || (this.reportsDate && this.reportsDate.getTime() !== data.date.getTime()) ) {
            this.reportsDate = new Date(data.date);
            this.changeReports$.next();
            // this.getReports(this.reportsDate);
          }
        } else {
          this.reportsDate = null;
          this.changeReports$.next();
          // this.getReports(null, true);
        }
      }
    );
  }

  private getReports(date: Date = null) {
    this.pending = true;
    const range = {start: moment(date).startOf('day'), end: moment(date).endOf('day')};

    const response$ = date ?
        this.adminService.searchReportsRequest(range.end.toISOString(), range.start.toISOString()) :
        this.adminService.getReportsData(this.reportsLimit);
    return response$.pipe(
        map((list: any) => {
            this.counter = list.length;
          return list.map((report, index) => {
            return {
              student_name: report.student.display_name + ` (${report.student.primary_email.split('@', 1)[0]})`,
              issuer: report.issuer.display_name,
              createdDate: Util.formatDateTime(new Date(report.created), false, false).split(', ')[0],
              created: Util.formatDateTime(new Date(report.created), false, false),
              message: report.message,
            };
          });

        }),
        map((list: any[]) => {
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
        })
      );
  }
  ngOnDestroy() {
    this.scrollPosition.saveComponentScroll(this.scrollableAreaName, this.scrollableArea.scrollTop);
  }

  updatePassCollection(sort) {
    this.sortMode = sort;
    const sort$ = of(this.sortMode).pipe(map(s => ({sort: s})));
    const search$ = this.searchQuery$.pipe(map(s => ({search_query: s})));
    const merged$ = mergeObject({sort: '-created', search_query: ''}, merge(sort$, search$));

    const mergedReplay = new ReplaySubject<HallPassFilter>(1);
    merged$.subscribe(mergedReplay);
    this.liveDataService.updateHallMonitorPassesRequest(merged$);
  }
}
