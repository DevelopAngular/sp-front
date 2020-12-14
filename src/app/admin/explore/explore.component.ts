import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, iif, Observable, of, Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {PagesDialogComponent} from './pages-dialog/pages-dialog.component';
import {filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
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
import {UNANIMATED_CONTAINER} from '../../consent-menu-overlay';
import {StorageService} from '../../services/storage.service';
import {PassCardComponent} from '../../pass-card/pass-card.component';
import {cloneDeep, isEqual} from 'lodash';
import {TableService} from '../sp-data-table/table.service';
import {ToastService} from '../../services/toast.service';
import {AdminService} from '../../services/admin.service';

declare const window;

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
export class ExploreComponent implements OnInit, OnDestroy {

  views: View = {
    'pass_search': {id: 1, title: 'Pass Search', color: '#00B476', icon: 'Pass Search', action: 'pass_search'},
    // 'report_search': {id: 2, title: 'Reports search', color: 'red', icon: 'Report Search', action: 'report_search'},
    'contact_trace': {id: 3, title: 'Contact trace', color: '#139BE6', icon: 'Contact Trace', action: 'contact_trace'},
    // 'rooms_usage': {id: 4, title: 'Rooms Usage', color: 'orange', icon: 'Rooms Usage', action: 'rooms_usage'}
  };

  isCheckbox$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  passSearchState: {
    loading$: Observable<boolean>,
    loaded$: Observable<boolean>
    isEmpty?: boolean,
    sortPasses$?: Observable<string>,
    sortPassesLoading$?: Observable<boolean>,
    countPasses$?: Observable<number>
  };
  contactTraceState: {
    loading$: Observable<boolean>,
    loaded$: Observable<boolean>,
    length$: Observable<number>,
    isEmpty?: boolean
  };
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
    selectedDate: null
  };
  contact_trace_passes: {
    [id: number]: HallPass
  } = {};

  searchedPassData$: Observable<any[]>;
  contactTraceData$: Observable<any[]>;
  queryParams: any;

  adminCalendarOptions;

  currentView$: BehaviorSubject<string> = new BehaviorSubject<string>(this.storage.getItem('explore_page') || 'pass_search');

  sortColumn: string;
  currentColumns: any;
  selectedRows: any[] = [];

  buttonForceTrigger$: Subject<any> = new Subject<any>();

  destroyPassClick = new Subject();
  destroy$ = new Subject();

  constructor(
    private dialog: MatDialog,
    private hallPassService: HallPassesService,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private http: HttpService,
    private contactTraceService: ContactTraceService,
    private storage: StorageService,
    private tableService: TableService,
    private toastService: ToastService,
    private adminService: AdminService
    ) {
    window.passClick = (id) => {
      this.passClick(id);
    };
  }

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
    this.passSearchState = {
      loading$: this.hallPassService.passesLoading$,
      loaded$: this.hallPassService.passesLoaded$,
      sortPasses$: this.hallPassService.sortPassesValue$,
      sortPassesLoading$: this.hallPassService.sortPassesLoading$,
      countPasses$: this.hallPassService.currentPassesCount$
    };
    this.contactTraceState = {
      loading$: this.contactTraceService.contactTraceLoading$,
      loaded$: this.contactTraceService.contactTraceLoaded$,
      length$: this.contactTraceService.contactTraceTotalLength$
    };

    this.http.globalReload$.pipe(
      switchMap(() => {
        return this.currentView$.asObservable();
      }),
      takeUntil(this.destroy$)
    )
      .subscribe((view: string) => {
        this.destroyPassClick.next();
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
          this.clearContactTraceData();
          this.adminCalendarOptions = null;
          this.contactTraceData = {
            selectedStudents: null,
            selectedDate: null
          };
          // this.adminCalendarOptions = {
          //   rangeId: 'range_5',
          //   toggleResult: 'Range'
          // };
          return this.contactTraceService.contactTraceLoaded$;
        }
      });

    this.schools$ = this.http.schoolsCollection$;

    this.searchedPassData$ = this.hallPassService.passesCollection$
        .pipe(
          filter((res: any[]) => this.currentView$.getValue() === 'pass_search'),
          map((passes: HallPass[]) => {
            const getColumns = this.storage.getItem(`order${this.currentView$.getValue()}`);
            const columns = {};
            if (getColumns) {
              const columnsOrder = ('Pass,' + getColumns).split(',');
              for (let i = 0; i < columnsOrder.length; i++) {
                Object.assign(columns, {[columnsOrder[i]]: null});
              }
              this.currentColumns = cloneDeep(columns);
            }
            if (!passes.length) {
              this.passSearchState.isEmpty = true;
              return getColumns ? [this.currentColumns] : [{
                'Pass': null,
                'Student Name': null,
                'Origin': null,
                'Destination': null,
                'Pass start time': null,
                'Duration': null
              }];
            }
            this.passSearchState.isEmpty = false;
            return passes.map(pass => {
              const duration = moment.duration(moment(pass.end_time).diff(moment(pass.start_time)));
              const passImg = this.domSanitizer.bypassSecurityTrustHtml(`<div class="pass-icon" onClick="passClick(${pass.id})" style="background: ${this.getGradient(pass.gradient_color)}; cursor: pointer">
<!--                                 <img *ngIf="${pass.icon}" width="15" src="${pass.icon}" alt="Icon">-->
                              </div>`);
              let rawObj: any = {
                'Pass': passImg,
                'Student Name': pass.student.display_name,
                'Origin': pass.origin.title,
                'Destination': pass.destination.title,
                'Pass start time': moment(pass.start_time).format('M/DD h:mm A'),
                'Duration': moment((Number.isInteger(duration.asMilliseconds()) ? duration.asMilliseconds() : duration.asMilliseconds())).format('mm:ss') + ' min',
              };

              const currentObj = {};
              if (this.storage.getItem(`order${this.currentView$.getValue()}`)) {
                Object.keys(this.currentColumns).forEach(key => {
                  currentObj[key] = rawObj[key];
                });
              }

              rawObj = this.storage.getItem(`order${this.currentView$.getValue()}`) ? currentObj : rawObj;

              Object.defineProperty(rawObj, 'id', { enumerable: false, value: pass.id});
              // Object.defineProperty(rawObj, 'sortStudentName', { enumerable: false, value: pass.student.last_name});
              Object.defineProperty(rawObj, 'date', {enumerable: false, value: moment(pass.created) });
              // Object.defineProperty(rawObj, 'sortDuration', {enumerable: false, value: duration });
              Object.defineProperty(rawObj, 'travelType', { enumerable: false, value: pass.travel_type });
              // Object.defineProperty(rawObj, '_data', {enumerable: false, value: rawObj });

              return rawObj;
            });
          })
        );

      this.contactTraceData$ = this.contactTraceService.contactTraceData$
        .pipe(
          filter(() => this.currentView$.getValue() === 'contact_trace'),
          map((contacts: ContactTrace[]) => {
            if (!contacts.length) {
              this.contactTraceState.isEmpty = true;
              return [{
                'Student Name': null,
                'Degree': null,
                'Contact connection': null,
                'Contact date': null,
                'Duration': null,
                'Passes': null
              }];
            }
            this.contactTraceState.isEmpty = false;
            this.contact_trace_passes = {};
            return contacts.map(contact => {
              const duration = moment.duration(contact.total_contact_duration, 'seconds');
              const connection: any[] =
                contact.contact_paths.length === 2 && isEqual(contact.contact_paths[0], contact.contact_paths[1]) ?
                  [contact.contact_paths[0]] :
                  contact.contact_paths.length === 4 && isEqual(contact.contact_paths[0], contact.contact_paths[1]) && isEqual(contact.contact_paths[2], contact.contact_paths[3]) ?
                    [contact.contact_paths[0], contact.contact_paths[2]] : contact.contact_paths;

              const result = {
                'Student Name': contact.student.display_name,
                'Degree': contact.degree,
                'Contact connection': this.domSanitizer.bypassSecurityTrustHtml(
                  `<div class="no-wrap" style="display: flex; width: 300px !important;">` +
                  connection.map(path => {
                  if (path.length === 1) {
                    return `<span style="margin-left: 5px">${path[0].display_name}</span>`;
                  } else {
                    return `<span style="margin-left: 5px">${path[0].display_name + ' to ' + path[1].display_name}</span>`;
                  }
                }).join() + `</div>`),
                'Contact date': moment(contact.initial_contact_date).format('M/DD h:mm A'),
                'Duration': moment((Number.isInteger(duration.asMilliseconds()) ? duration.asMilliseconds() : duration.asMilliseconds())).format('mm:ss') + ' min',
                'Passes': this.domSanitizer.bypassSecurityTrustHtml(`<div style="display: flex">` +
                  contact.contact_passes
                    .map(({contact_pass, student_pass}, index) => {
                      this.contact_trace_passes = {
                        ...this.contact_trace_passes,
                        [contact_pass.id]: contact_pass,
                        [student_pass.id]: student_pass
                      };
                    return `<div style="display: flex; ${(index > 0 ? 'margin-left: 5px' : '')}">
                            <div class="pass-icon" onClick="passClick(${contact_pass.id})" style="background: ${this.getGradient(contact_pass.gradient_color)}; cursor: pointer"></div>
                            <div class="pass-icon" onClick="passClick(${student_pass.id})" style="background: ${this.getGradient(student_pass.gradient_color)}; margin-left: 5px; cursor: pointer"></div>
                        </div>`;
                  }).join('') + `</div>`
                )
              };

              Object.defineProperty(result, 'id', { enumerable: false, value: contact.contact_passes[0].contact_pass.id});
              // Object.defineProperty(result, 'sortStudentName', { enumerable: false, value: contact.student.last_name});
              Object.defineProperty(result, 'date', {enumerable: false, value: moment(contact.initial_contact_date) });
              // Object.defineProperty(result, 'sortDuration', {enumerable: false, value: duration });
              // Object.defineProperty(result, '_data', {enumerable: false, value: result });
              return result;
            });
          })
        );

      this.tableService.selectRow.asObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.selectedRows = res;
        });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyPassClick.next();
    this.destroyPassClick.complete();
  }

  getGradient(gradient: string) {
    const colors = gradient.split(',');
    return 'radial-gradient(circle at 73% 71%, ' + (colors[0]) + ', ' + colors[1] + ')';
  }

  openSwitchPage(event) {
    UNANIMATED_CONTAINER.next(true);
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
      .pipe(
        tap(() => UNANIMATED_CONTAINER.next(false)),
        filter(res => !!res)
      )
      .subscribe(action => {
        this.currentView$.next(action);
        this.storage.setItem('explore_page', action);
        this.cdr.detectChanges();
    });
  }

  passClick(id) {
    iif(() => this.currentView$.getValue() === 'pass_search', this.hallPassService.passesEntities$.pipe(take(1)), of(this.contact_trace_passes))
      .pipe(
        takeUntil(this.destroyPassClick),
        map(passes => {
          return passes[id];
        })).subscribe(pass => {
      pass.start_time = new Date(pass.start_time);
      pass.end_time = new Date(pass.end_time);
      const data = {
        pass: pass,
        fromPast: true,
        forFuture: false,
        forMonitor: false,
        isActive: false,
        forStaff: true,
      };
      const dialogRef = this.dialog.open(PassCardComponent, {
        panelClass: 'search-pass-card-dialog-container',
        backdropClass: 'custom-bd',
        data: data,
      });
    });
  }

  openFilter(event, action) {
    UNANIMATED_CONTAINER.next(true);
    if (action === 'students' || action === 'destination' || action === 'origin') {
      const studentFilter = this.dialog.open(StudentFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': new ElementRef(event).nativeElement,
          'selectedStudents': this.currentView$.getValue() === 'pass_search' ? this.passSearchData.selectedStudents : this.contactTraceData.selectedStudents,
          'type': action === 'students' ? 'selectedStudents' : 'rooms',
          'rooms': this.currentView$.getValue() === 'pass_search' ? (action === 'origin' ? this.passSearchData.selectedOriginRooms : this.passSearchData.selectedDestinationRooms) : this.contactTraceData.selectedDestinationRooms,
          'multiSelect': this.currentView$.getValue() === 'pass_search'
        }
      });

      studentFilter.afterClosed()
        .pipe(
          tap(() => UNANIMATED_CONTAINER.next(false)),
          filter(res => res)
        )
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
          if (this.isSearched || this.currentView$.getValue() === 'contact_trace') {
            this.autoSearch();
          }
          this.cdr.detectChanges();
        });
    } else if (action === 'calendar') {
      const calendar = this.dialog.open(DateTimeFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          target: new ElementRef(event),
          date: (this.currentView$.getValue() === 'pass_search' ? this.passSearchData.selectedDate : this.contactTraceData.selectedDate),
          options: this.adminCalendarOptions
        }
      });

      calendar.afterClosed()
        .pipe(
          tap(() => UNANIMATED_CONTAINER.next(false)),
          filter(res => res)
        )
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
        if (this.isSearched || this.currentView$.getValue() === 'contact_trace') {
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
        return;
      }
      if (this.isSearched) {
        this.search();
        return;
      }
    } else if (this.currentView$.getValue() === 'contact_trace' && this.showContactTraceTable) {
      this.contactTraceService.clearContactTraceDataRequest();
      this.showContactTraceTable = false;
      this.contactTraceState.isEmpty = false;
    }
  }

  search(limit: number = 300) {
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
        url += (end ? ('end_time_before=' + end + '&') : '');
      }
    }
    url = url + 'total_count=true&';
    this.queryParams = url.substring(url.lastIndexOf('&') + 1);
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

  clearContactTraceData() {
    this.contactTraceService.clearContactTraceDataRequest();
    this.showContactTraceTable = false;
    this.contactTraceState.isEmpty = false;
    this.adminCalendarOptions = null;
    this.contactTraceData = {
      selectedStudents: null,
      selectedDate: null
    };
  }

  sortHeaders(sortColumn) {
    const queryParams: any = {};
    this.sortColumn = sortColumn;
    this.passSearchState.sortPasses$
      .pipe(take(1))
      .subscribe(sort => {
        switch (sortColumn) {
          case 'Student Name':
            queryParams.sort = sort && sort === 'asc' ? '-student_name' : 'student_name';
            break;
          case 'Origin':
            queryParams.sort = sort && sort === 'asc' ? '-origin_name' : 'origin_name';
            break;
          case 'Destination':
            queryParams.sort = sort && sort === 'asc' ? '-destination_name' : 'destination_name';
            break;
          case 'Duration':
            queryParams.sort = sort && sort === 'asc' ? '-duration' : 'duration';
            break;
          case 'Pass start time':
            queryParams.sort = sort && sort === 'asc' ? '-start_time' : 'start_time';
        }
        if (sort === 'desc') {
          delete queryParams.sort;
        }
        queryParams.limit = 300;
        this.queryParams = queryParams;
        this.hallPassService.sortHallPassesRequest(queryParams);
      });
  }

  openInvalidFields() {
    if (!this.contactTraceData.selectedStudents || (!this.contactTraceData.selectedStudents && !this.contactTraceData.selectedDate)) {
      this.buttonForceTrigger$.next('students');
      return;
    } else if (!this.contactTraceData.selectedDate) {
      this.buttonForceTrigger$.next('calendar');
      return;
    }
  }

  exportPasses() {
    this.adminService.exportCsvPasses(this.queryParams).subscribe(res => {
      this.toastService.openToast(
        {
          title: 'Generating CSV...',
          subtitle: 'When it’s ready (1-2min), we’ll send you a download link to your email.',
          noButton: true
        }
      );
    });
  }
}
