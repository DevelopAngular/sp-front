import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MatDialog} from '@angular/material';
import {PagesDialogComponent} from './pages-dialog/pages-dialog.component';
import {filter, map, startWith, switchMap} from 'rxjs/operators';
import {StudentFilterComponent} from './student-filter/student-filter.component';
import {User} from '../../models/User';
import {HallPass} from '../../models/HallPass';
import * as moment from 'moment';
import {HallPassesService} from '../../services/hall-passes.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {School} from '../../models/School';
import {ContactTraceService} from '../../services/contact-trace.service';
import {ContactTrace} from '../../models/ContactTrace';
import {DateTimeFilterComponent} from '../search/date-time-filter/date-time-filter.component';

export interface View {
  [view: string]: CurrentView;
}

export interface CurrentView {
  id: number;
  title: string;
  color: string;
  icon: string;
  action: string;
}

export enum SearchPages {
  search = 1,
  report = 2,
  contact = 3,
  rooms = 4
}

export interface SearchData {
  selectedStudents: User[];
  selectedDate: {start: moment.Moment, end: moment.Moment};
  selectedDestinationRooms?: any[];
  selectedOriginRooms?: any[];
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreComponent implements OnInit {

  views: View = {
    'pass_search': {id: 1, title: 'Pass Search', color: '#00B476', icon: 'Pass Search', action: 'pass_search'},
    // 'report_search': {id: 2, title: 'Reports search', color: 'red', icon: 'Report Search', action: 'report_search'},
    'contact_trace': {id: 3, title: 'Contact trace', color: '#139BE6', icon: 'Contact Trace', action: 'contact_trace'},
    // 'rooms_usage': {id: 4, title: 'Rooms Usage', color: 'orange', icon: 'Rooms Usage', action: 'rooms_usage'}
  };

  isCheckbox$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingPasses$: Observable<boolean>;
  loadingContacts$: Observable<boolean>;
  isSearched: boolean;
  showContactTraceTable: boolean;
  schools$: Observable<School[]>;

  passSearchData: SearchData = {
    selectedStudents: null,
    selectedOriginRooms: null,
    selectedDestinationRooms: null,
    selectedDate: null,
  };
  contactTraceData: SearchData = {
    selectedStudents: null,
    selectedDate: {start: moment().subtract(3, 'days').startOf('day'), end: moment()}
  };

  searchedPassData$: any;
  contactTraceData$: any;

  adminCalendarOptions;

  currentView$: BehaviorSubject<string> = new BehaviorSubject<string>('pass_search');

  constructor(
    private dialog: MatDialog,
    private hallPassService: HallPassesService,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private http: HttpService,
    private contactTraceService: ContactTraceService
    ) { }

  dateText({start, end}): string {
    if (start.isSame(moment().subtract(3, 'days'), 'day')) {
      return 'Last 3 days';
    } else if (start.isSame(moment().subtract(7, 'days'), 'day')) {
      return  'Last 7 days';
    } else if (start.isSame(moment().subtract(30, 'days'), 'day')) {
      return 'Last 30 days';
    } else if (start.isSame(moment().subtract(90, 'days'), 'day')) {
      return 'Last 90 days';
    }
    if (start && end) {
      if (this.currentView$.getValue() === 'pass_search') {
        return this.passSearchData.selectedDate &&
        start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
      } else {
        return this.contactTraceData.selectedDate &&
        start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
      }
    }
  }

  ngOnInit() {
    this.loadingPasses$ = this.hallPassService.passesLoading$;
    this.loadingContacts$ = this.contactTraceService.contactTraceLoading$;
    this.currentView$.asObservable()
      .subscribe((view: string) => {
        if (view === 'pass_search') {
          this.passSearchData = {
            selectedStudents: null,
            selectedDestinationRooms: null,
            selectedOriginRooms: null,
            selectedDate: null,
          };
          this.search(300);
          return this.hallPassService.passesLoaded$;
        } else if (view === 'contact_trace') {
          this.showContactTraceTable = false;
          this.contactTraceService.clearContactTraceDataRequest();
          this.contactTraceData = {
            selectedStudents: null,
            selectedDate: {start: moment().subtract(3, 'days').startOf('day'), end: moment()}
          };
          this.adminCalendarOptions = {
            rangeId: 'range_5',
            toggleResult: 'Range'
          };
          return this.contactTraceService.contactTraceLoaded$;
        }
      });

    this.schools$ = this.http.schoolsCollection$;

    this.searchedPassData$ = this.hallPassService.passesCollection$
        .pipe(
          filter((res: any[]) => this.currentView$.getValue() === 'pass_search'),
          map((passes: HallPass[]) => {
            if (!passes.length) {
              return [{
                'Pass': null,
                'Student Name': null,
                'Origin': null,
                'Destination': null,
                'Pass start time': null,
                'Duration': null
              }];
            }
            return passes.map(pass => {
              const duration = moment.duration(moment(pass.end_time).diff(moment(pass.start_time)));
              const passImg = this.domSanitizer.bypassSecurityTrustHtml(`<div class="pass-icon" style="background: ${this.getGradient(pass.gradient_color)}">
<!--                                 <img *ngIf="${pass.icon}" width="15" src="${pass.icon}" alt="Icon">-->
                              </div>`);
              const rawObj = {
                'Pass': passImg,
                'Student Name': pass.student.display_name,
                'Origin': pass.origin.title,
                'Destination': pass.destination.title,
                'Pass start time': moment(pass.start_time).format('M/DD h:mm A'),
                'Duration': (Number.isInteger(duration.asMinutes()) ? duration.asMinutes() : duration.asMinutes().toFixed(2)) + ' min'
              };

              Object.defineProperty(rawObj, 'id', { enumerable: false, value: pass.id});
              Object.defineProperty(rawObj, 'date', {enumerable: false, value: moment(pass.created) });
              Object.defineProperty(rawObj, 'sortDuration', {enumerable: false, value: duration });
              Object.defineProperty(rawObj, 'travelType', { enumerable: false, value: pass.travel_type });
              Object.defineProperty(rawObj, '_data', {enumerable: false, value: rawObj });

              return rawObj;
            });
          })
        );

      this.contactTraceData$ = this.contactTraceService.contactTraceData$
        .pipe(
          filter(() => this.currentView$.getValue() === 'contact_trace'),
          map((contacts: ContactTrace[]) => {
            if (!contacts.length) {
              return [{
                'Student Name': null,
                'Degree': null,
                'Contact connection': null,
                'Contact date': null,
                'Duration': null,
                'Pass': null
              }];
            }
            return contacts.map(contact => {
              const duration = moment.duration(contact.total_contact_duration);

              const result = {
                'Student Name': contact.student.display_name,
                'Degree': contact.degree,
                'Contact connection': contact.contact_paths[0][0].display_name,
                'Contact date': moment(contact.initial_contact_date).format('M/DD h:mm A'),
                'Duration': (Number.isInteger(duration.asMinutes()) ? duration.asMinutes() : duration.asMinutes().toFixed(2)) + ' min',
                'Pass': this.domSanitizer
                  .bypassSecurityTrustHtml(`<div class="pass-icon" style="background: ${this.getGradient(contact.contact_passes[0].contact_pass.gradient_color)}"></div>`)
              };

              Object.defineProperty(result, 'id', { enumerable: false, value: contact.contact_passes[0].contact_pass.id});

              return result;
            });
          })
        );
  }

  getGradient(gradient: string) {
    const colors = gradient.split(',');
    return 'radial-gradient(circle at 73% 71%, ' + (colors[0]) + ', ' + colors[1] + ')';
  }

  openSwitchPage(event) {
    const pagesDialog = this.dialog.open(PagesDialogComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': event.currentTarget,
        'pages': Object.values(this.views),
        'selectedPage': this.views[this.currentView$.getValue()]
      }
    });

    pagesDialog.afterClosed()
      .pipe(filter(res => !!res))
      .subscribe(action => {
        this.currentView$.next(action);
        this.cdr.detectChanges();
    });
  }

  openFilter(event, action) {
    if (action === 'students' || action === 'destination' || action === 'origin') {
      const studentFilter = this.dialog.open(StudentFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': event.currentTarget,
          'selectedStudents': action === 'students' ? this.passSearchData.selectedStudents : this.contactTraceData.selectedStudents,
          'type': action === 'students' ? 'selectedStudents' : 'rooms',
          'rooms': this.currentView$.getValue() === 'pass_search' ? (action === 'origin' ? this.passSearchData.selectedOriginRooms : this.passSearchData.selectedDestinationRooms) : this.contactTraceData.selectedDestinationRooms,
          'multiSelect': this.currentView$.getValue() === 'pass_search'
        }
      });

      studentFilter.afterClosed()
        .pipe(filter(res => res))
        .subscribe(({students, type}) => {
          if (type === 'rooms') {
            if (action === 'origin') {
              this.passSearchData.selectedOriginRooms = students;
            } else if (action === 'destination') {
              this.passSearchData.selectedDestinationRooms = students;
            }
          } else if (type === 'selectedStudents') {
            if (this.currentView$.getValue() === 'pass_search') {
              this.passSearchData.selectedStudents = students;
            } else {
              this.contactTraceData.selectedStudents = students;
            }
          }
          if (this.isSearched) {
            this.autoSearch();
          }
          this.cdr.detectChanges();
        });
    } else if (action === 'calendar') {
      const target = new ElementRef(event.currentTarget);
      const calendar = this.dialog.open(DateTimeFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          target,
          date: (this.currentView$.getValue() === 'pass_search' ? this.passSearchData.selectedDate : this.contactTraceData.selectedDate),
          options: this.adminCalendarOptions
        }
      });

      calendar.afterClosed()
        .pipe(filter(res => res))
        .subscribe(({date, options}) => {
          this.adminCalendarOptions = options;
          if (this.currentView$.getValue() === 'pass_search') {
            if (!date.start) {
              this.passSearchData.selectedDate = {start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes')};
            } else {
              this.passSearchData.selectedDate = {start: date.start.startOf('day'), end: date.end.endOf('day')};
            }
          } else {
            if (!date.start) {
              this.contactTraceData.selectedDate = {start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes')};
            } else {
              this.contactTraceData.selectedDate = {start: date.start.startOf('day'), end: date.end.endOf('day')};
            }
          }
        if (this.isSearched) {
          this.autoSearch();
        }
        this.cdr.detectChanges();
      });
    }
  }

  loadMorePasses() {
    this.hallPassService.getMorePasses();
  }

  autoSearch() {
    if (this.currentView$.getValue() === 'pass_search') {
      if (!this.passSearchData.selectedDestinationRooms && !this.passSearchData.selectedOriginRooms && !this.passSearchData.selectedDate && !this.passSearchData.selectedStudents) {
        this.search(300);
      }
      if (this.isSearched) {
        this.search();
      }
    }
  }

  search(limit: number = 100000) {
    let url = `v1/hall_passes?limit=${limit}&`;
    if (this.passSearchData.selectedDestinationRooms) {
      this.passSearchData.selectedDestinationRooms.forEach(room => {
        url += 'destination=' + room.id + '&';
      });
    }
    if (this.passSearchData.selectedOriginRooms) {
      this.passSearchData.selectedOriginRooms.forEach(room => {
        url += 'origin=' + room.id + '&';
      });
    }
    if (this.passSearchData.selectedStudents) {
      const students: any[] = this.passSearchData.selectedStudents.map(s => s['id']);
      Array.from(Array(students.length).keys()).map(i => {
        url += 'student=' + students[i] + '&';
      });
    }

    if (this.passSearchData.selectedDate) {
      let start;
      let end;
      if (this.passSearchData.selectedDate['start']) {
        start = this.passSearchData.selectedDate['start'].toISOString();
        url += (start ? ('created_after=' + start + '&') : '');
      }
      if (this.passSearchData.selectedDate['end']) {
        end = this.passSearchData.selectedDate['end'].toISOString();
        url += (end ? ('end_time_before=' + end) : '');
      }
    }

    this.hallPassService.searchPassesRequest(url);
    this.isSearched = true;
  }

  contactTrace() {
    this.showContactTraceTable = true;
    this.contactTraceService.getContactsRequest(
      this.contactTraceData.selectedStudents.map(s => s.id),
      this.contactTraceData.selectedDate['start'].toISOString()
    );
  }

}
