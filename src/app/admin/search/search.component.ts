import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {filter, switchMap, tap} from 'rxjs/operators';
import {HttpService} from '../../services/http-service';
import {HallPass} from '../../models/HallPass';
import {PdfGeneratorService, SP_ARROW_BLUE_GRAY, SP_ARROW_DOUBLE_BLUE_GRAY} from '../pdf-generator.service';
import {find} from 'lodash';
import {PassCardComponent} from '../../pass-card/pass-card.component';
import {MatDialog} from '@angular/material';
import {HallPassesService} from '../../services/hall-passes.service';
import {XlsxGeneratorService} from '../xlsx-generator.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {of, Subscription} from 'rxjs';
import {DataService} from '../../services/data-service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {SearchFilterDialogComponent} from './search-filter-dialog/search-filter-dialog.component';
import {DateTimeFilterComponent} from './date-time-filter/date-time-filter.component';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

import * as moment from 'moment';
import {bumpIn} from '../../animations';
import {prettyDate, wrapToHtml} from '../helpers';
import {XsButtonComponent} from '../../xs-button/xs-button.component';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [bumpIn]
})
export class SearchComponent implements OnInit {




  @ViewChild('printPdf') printPdf: ElementRef;
  b;
  @ViewChildren(XsButtonComponent) set xsb(xsb: QueryList<XsButtonComponent>) {
    if (xsb) {
      this.b = xsb;
      // console.log(this.b);
    }
  }

  tableData = [];
  selectedStudents = [];
  selectedDate;
  selectedRooms = [];
  roomSearchType;
  selectedReport = [];
  passes: HallPass[] = [];

  adminCalendarOprions;

  selRoomsWithCategories;

  spinner: boolean = false;

  hasSearched: boolean = false;
  sortParamsHeader: string;
  initialSearchStudentString: string = '';
  initialSearchLocationString: string = '';
  inputPanelVisibility: boolean = true;

  buttonDown: boolean;

  constructor(
      private httpService: HttpService,
      private hallPassService: HallPassesService,
      private pdf: PdfGeneratorService,
      private xlsx: XlsxGeneratorService,
      private elRef: ElementRef,
      public dialog: MatDialog,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private userService: UserService,
      public dataService: DataService,
      public darkTheme: DarkThemeSwitch,
      private domSanitizer: DomSanitizer


  ) {
  }

  get buttonState() {
     return this.buttonDown ? 'down' : 'up';
  }

  get dateText() {
      const start = this.selectedDate.start;
      const end = this.selectedDate.end;
      if (start && end) {
          return this.selectedDate &&
              start.isSame(end, 'day') ? start.format('MMM D') : start.format('MMM D') + ' to ' + end.format('MMM D');
      }
  }

  ngOnInit() {

    this.httpService.globalReload$.subscribe(() => {
      this.resetSearchState();
      this.b.map((b: XsButtonComponent) => b.resetEmit());
      this.selectedDate = null;
    });

    const forceSearch: Subscription = this.activatedRoute.queryParams.pipe(
      filter((qp) => Object.keys(qp).length > 0 && Object.keys(qp).length === Object.values(qp).length),
      switchMap((qp: any): any => {
        this.inputPanelVisibility = false;

        const {profileId, profileName, role } = qp;
        this.router.navigate( ['admin/search']);

        switch (role) {
          case '_profile_student':

            return this.userService.searchProfileById(profileId).pipe(
              tap((profile: User) => {
                this.initialSearchStudentString = profile.display_name;
                this.selectedStudents.push(profile);
                this.search();
            }));
          case '_profile_teacher':

            return this.userService.searchProfileById(profileId)
              .pipe(
                switchMap((profile: User) => {
                  return this.dataService.getLocationsWithTeacher(profile);
                }),
                tap((locations: Location[]) => {
                  this.roomSearchType = 'Either';
                  this.selectedRooms = locations;
                  const titleArray = locations.map((loc) => {
                    return `${loc.title}(${loc.room})`;
                  });
                  this.initialSearchLocationString = titleArray.join(', ');
                  this.search();
                })
              );

          // case '_profile_assistant':
          //   return this.userService.searchProfileById(profileId)
          //     .pipe(
          //       tap((user: User) => {
          //         debugger;
          //         this.search();
          //       })
          //     );
          default:
            return of(null);
        }
      })
    ).subscribe((v) => {
      this.inputPanelVisibility = true;
      forceSearch.unsubscribe();
    });

  }

  onPress(press: boolean) {
    this.buttonDown = press;
  }

  private wrapToHtml(data, htmlTag, dataSet?) {
    const wrapper =  wrapToHtml.bind(this);
    return wrapper(data, htmlTag, dataSet);
  }

  search() {

      this.spinner = true;
      this.selectedReport = [];

      let url = 'v1/hall_passes?';
      if (this.selectedRooms) {
        this.selectedRooms.forEach(room => {
          if (room.filter === 'Origin') {
              url += 'origin=' + room.id + '&';
          }
          if (room.filter === 'Destination') {
              url += 'destination=' + room.id + '&';
          }
          if (room.filter === 'Either') {
              url += 'location=' + room.id + '&';
          }
        });

      }
      if (this.selectedStudents) {
        const students: any[] = this.selectedStudents.map(s => s['id']);
        Array.from(Array(students.length).keys()).map(i => {
          url += 'student=' + students[i] + '&';
        });
      }

      if (this.selectedDate) {
        let start;
        let end;
        if (this.selectedDate['start']) {
          start = this.selectedDate['start'].toISOString();
          url += (start ? ('created_after=' + start + '&') : '');
        }
        if (this.selectedDate['end']) {
          end = this.selectedDate['end'].toISOString();
          url += (end ? ('end_time_before=' + end) : '');
        }
      }

      this.hallPassService
        .searchPasses(url)
        .pipe(filter(res => !!res))
        .subscribe((passes: HallPass[]) => {

          this.passes = passes;
          this.tableData = passes.map((hallPass, i) => {

            const duration = moment.duration(moment(hallPass.end_time).diff(moment(hallPass.start_time)));

            const name = hallPass.student.first_name + ' ' + hallPass.student.last_name +
                ` (${hallPass.student.primary_email.split('@', 1)[0]})`;

            const rawObj = {
                'Student Name': name,
                'Origin': hallPass.origin.title,
                'TT': hallPass.travel_type === 'one_way' ? SP_ARROW_BLUE_GRAY : SP_ARROW_DOUBLE_BLUE_GRAY,
                'Destination': hallPass.destination.title,
                'Date & Time': moment(hallPass.created).format('M/DD h:mm A'),
                'Duration': (Number.isInteger(duration.asMinutes()) ? duration.asMinutes() : duration.asMinutes().toFixed(2)) + ' min'
            };

            const record = this.wrapToHtml(rawObj, 'span') as {[key: string]: SafeHtml; _data: any};


            Object.defineProperty(rawObj, 'id', { enumerable: false, value: hallPass.id});
            Object.defineProperty(rawObj, 'date', {enumerable: false, value: moment(hallPass.created) });
            Object.defineProperty(rawObj, 'sortDuration', {enumerable: false, value: duration });
            Object.defineProperty(rawObj, 'travelType', { enumerable: false, value: hallPass.travel_type });

            Object.defineProperty(record, '_data', {enumerable: false, value: rawObj });
            return record;
          });
          this.spinner = false;
          this.hasSearched = true;
        });

    // }
  }

  openFilters(state: string) {
    const filterRef = this.dialog.open(SearchFilterDialogComponent, {
        panelClass: 'accounts-profiles-dialog',
        backdropClass: 'custom-bd',
        data: {
            state,
            students: this.selectedStudents,
            rooms: this.selectedRooms,
            withCategories: this.selRoomsWithCategories
        }
    });

    filterRef.afterClosed().pipe(filter(data => !!data)).subscribe(data => {
      if (data.action === 'students') {
        this.selectedStudents = data.students;
      } else if (data.action === 'rooms') {
        this.selectedRooms = data.locations;
        this.selRoomsWithCategories = data.allSelected;
      }
      this.hasSearched = false;
    });
  }

  openTimeFilter(event) {
    const target = new ElementRef(event.currentTarget);
    const timeRef = this.dialog.open(DateTimeFilterComponent, {
        panelClass: 'calendar-dialog-container',
        backdropClass: 'invis-backdrop',
        data: { target, options: this.adminCalendarOprions, date: this.selectedDate }
    });

    timeRef.afterClosed().pipe(filter(res => !!res))
        .subscribe(({date, options}) => {
            this.adminCalendarOprions = options;
            if (!date.start) {
                this.selectedDate = {start: moment(date).add(6, 'minutes'), end: moment(date).add(6, 'minutes')};
            } else {
                this.selectedDate = {start: date.start.startOf('day'), end: date.end.endOf('day')};
            }
            this.hasSearched = false;
        });
  }

  selectedPass(pass) {
    const selectedPass: HallPass = find<HallPass>(this.passes, {id: pass['id']});
    selectedPass.start_time = new Date(selectedPass.start_time);
    selectedPass.end_time = new Date(selectedPass.end_time);
      const data = {
          pass: selectedPass,
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
  }

  resetSearchState() {
    this.tableData = [];
    this.selectedReport = [];
    this.hasSearched = false;
  }

  previewPDF(event) {
    const data = this.selectedReport.length ? this.selectedReport : this.tableData.map(pass => pass._data);
    if (data.length > 0) {
      const _selectedReport = data.map((row) => {
        if (row.travelType === 'round_trip') {
          row.TT = 'RT';
        } else if (row.travelType === 'one_way') {
          row.TT = 'OW';
        }
        const _copy = {};
        for (const key in row) {
          if (row.hasOwnProperty(key) && key !== 'hovered' && key !== 'pressed') {
            _copy[key] = typeof row[key] !== 'string' ? row[key] + ' min' : row[key];
          }
        }
        return _copy;
      });

      let prettyFrom = '';
      let prettyTo = '';
      if (this.selectedDate) {
        prettyFrom = prettyDate(this.selectedDate.start.toDate());
        prettyTo = prettyDate(this.selectedDate.end.toDate());
      }
      let rooms = '';
      if (this.selectedRooms) {
        rooms = this.selectedRooms.map((room) => {
          return room.title;
        }).join(', ');
      }

      // const title = `${this.sortParamsHeader}: ${this.selectedDate ? `from ${prettyFrom} to ${prettyTo};` : ''} ${this.selectedRooms ? rooms : ''}`;
        const title = '';

      console.log('_selectedReport', _selectedReport);
      this.pdf.generateReport(_selectedReport, 'l', 'search', title);
    } else {
      event.preventDefault();
    }
  }

}
