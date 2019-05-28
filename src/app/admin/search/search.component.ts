import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {filter, switchMap, tap} from 'rxjs/operators';
import { HttpService } from '../../services/http-service';
import { HallPass } from '../../models/HallPass';
import { DatePrettyHelper } from '../date-pretty.helper';
import { PdfGeneratorService } from '../pdf-generator.service';
import { disableBodyScroll } from 'body-scroll-lock';
import * as _ from 'lodash';
import {PassCardComponent} from '../../pass-card/pass-card.component';
import {MatDialog} from '@angular/material';
import {HallPassesService} from '../../services/hall-passes.service';
import {XlsxGeneratorService} from '../xlsx-generator.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {DataService} from '../../services/data-service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {SearchFilterDialogComponent} from './search-filter-dialog/search-filter-dialog.component';
import {DateTimeFilterComponent} from './date-time-filter/date-time-filter.component';
import {DomSanitizer} from '@angular/platform-browser';

import * as moment from 'moment';



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild('printPdf') printPdf: ElementRef;

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
      private domSanitazer: DomSanitizer

  ) {
  }

  get isDisabled() {
    return !this.selectedStudents.length && !this.selectedDate && !this.selectedRooms.length && !this.hasSearched || this.spinner;
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

    disableBodyScroll(this.elRef.nativeElement);

    const forceSearch: Subscription = this.activatedRoute.queryParams.pipe(
      filter((qp) => Object.keys(qp).length > 0 && Object.keys(qp).length === Object.values(qp).length),
      switchMap((qp: any): any => {
        this.inputPanelVisibility = false;
        // console.log('qp', qp);
        const {profileId, profileName, role } = qp;
        this.router.navigate( ['admin/search']);
        console.log(profileId);
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
                  // console.log(this.initialSearchLocationString);
                  this.search();
                })
              );
          default:
            return of(null);
        }
      })
    ).subscribe((v) => {
      this.inputPanelVisibility = true;
      console.log(v, forceSearch );
      forceSearch.unsubscribe();
    });

  }

  search(query: string = '') {
    // if (this.selectedStudents.length || this.selectedDate || this.selectedRooms.length || query) {
    //   this.sortParamsHeader = `All Passes, Searching by ${(this.selectedStudents && this.selectedStudents.length > 0 ? 'Student Name' : '') + (this.selectedDate && this.selectedDate !== '' ? ', Date & Time' : '') + (this.selectedRooms && this.selectedRooms.length > 0 ? ', Room Name' : '')}`;
      this.spinner = true;
      this.selectedReport = [];
      let url = 'v1/hall_passes?' + query;
      if (this.selectedRooms) {
        console.log(this.selectedRooms);
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
        // console.log('URL ===>>>>', url);
      //   console.log('Has rooms\t', this.roomSearchType);
      //   if (this.roomSearchType == 'Origin') {
      //     let origins: any[] = this.selectedRooms.map(r => r['id']);
      //
      //     Array.from(Array(origins.length).keys()).map(i => {
      //       url += 'origin=' + origins[i] + '&';
      //     });
      //   }
      //
      //   if (this.roomSearchType == 'Destination') {
      //     let destinations: any[] = this.selectedRooms.map(r => r['id']);
      //
      //     Array.from(Array(destinations.length).keys()).map(i => {
      //       url += 'destination=' + destinations[i] + '&';
      //     });
      //   }
      //
      //   if (this.roomSearchType == 'Either') {
      //     let locations: any[] = this.selectedRooms.map(r => r['id']);
      //
      //     Array.from(Array(locations.length).keys()).map(i => {
      //       url += 'location=' + locations[i] + '&';
      //     });
      //   }
      }
      if (this.selectedStudents) {
        let students: any[] = this.selectedStudents.map(s => s['id']);

        Array.from(Array(students.length).keys()).map(i => {
          url += 'student=' + students[i] + '&';
        });
      }

      if (this.selectedDate) {
        let start;
        let end;
        if(this.selectedDate['start']){
          start = this.selectedDate['start'].toISOString();
          url += (start ? ('created_after=' + start + '&') : '');
        }
        if(this.selectedDate['end']){
          end = this.selectedDate['end'].toISOString();
          url += (end ? ('end_time_before=' + end) : '');
        }

        console.log('Start: ', start, '\nEnd: ', end);

      }

      this.hallPassService.searchPasses(url).pipe(filter(res => !!res))
        .subscribe((data: HallPass[]) => {

          console.log('DATA', data);
          this.passes = data;
          this.tableData = data.map(hallPass => {
            // let travelType;
            //             // if (hallPass.travel_type === 'one_way') {
            //             //   travelType = `<svg width="15px" height="15px" viewBox="0 0 160 140">
            //             //                   <title>SP Arrow (Blue-Gray)</title>
            //             //                   <desc>Created with Sketch.</desc>
            //             //                   <g id="SP-Arrow-(Blue-Gray)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            //             //                     <g id="Logo" transform="translate(3.000000, 0.000000)" fill="#7F879D" fill-rule="nonzero">
            //             //                       <path d="M127.685045,98.1464997 L80.6403711,145.191173 C74.2538542,151.57769 63.9281157,151.606542 57.5771895,145.255616 C51.226263,138.904689 51.2551148,128.578951 57.6416316,122.192434 L104.686305,75.1477605 L57.3461108,27.8075658 C50.9595937,21.4210488 50.9307419,11.0953107 57.2816684,4.74438419 C63.6325949,-1.60654219 73.9583331,-1.57769053 80.34485,4.80882648 L139.415225,63.8792012 C145.703488,70.1674642 145.731895,80.3343446 139.478676,86.5875648 L127.802392,98.2638476 L127.685045,98.1464997 Z M51.229003,99.7185895 L27.7048949,123.242698 C21.3326816,129.614911 11.0584973,129.672126 4.7568622,123.370491 C-1.54477286,117.068856 -1.48755764,106.794672 4.88465572,100.422458 L28.4087639,76.8983503 L4.81684319,53.3064295 C-1.55537032,46.934216 -1.61258544,36.6600316 4.68904964,30.3583967 C10.9906847,24.0567616 21.2648689,24.1139768 27.6370822,30.4861904 L62.7366843,65.5857925 C69.0108639,71.859972 69.0671988,81.9760916 62.862512,88.1807786 L51.2768521,99.7664383 L51.229003,99.7185895 Z" id="Arrow"></path>
            //             //                     </g>
            //             //                   </g>
            //             //                 </svg>`;
            //             // }
            //             // if (hallPass.travel_type === 'round_trip' || hallPass.travel_type === 'both') {
            //             //   travelType = `<svg width="23px" height="11px" viewBox="0 50 150 50">
            //             //                   <title>SP Arrow Double (Blue-Gray)</title>
            //             //                   <desc>Created with Sketch.</desc>
            //             //                   <g id="SP-Arrow-Double-(Blue-Gray)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            //             //                     <g id="Logo" transform="translate(88.000000, 43.000000)" fill="#7F879D" fill-rule="nonzero">
            //             //                       <path d="M54.9182725,41.8758399 L34.6840139,61.948234 C31.9371262,64.6731479 27.4959505,64.685458 24.7643707,61.9757295 C22.0327907,59.2660009 22.0452001,54.8603525 24.7920877,52.1354387 L45.0263463,32.0630445 L24.6649821,11.8645614 C21.9180943,9.1396475 21.9056849,4.73399923 24.6372649,2.02427059 C27.3688449,-0.685458001 31.8100205,-0.673147961 34.5569081,2.05176596 L59.9635087,27.2551259 C62.6681366,29.9381181 62.680355,34.275987 59.9907994,36.9440276 L54.9687445,41.9259083 L54.9182725,41.8758399 Z M22.0339692,42.5465982 L11.9160781,52.583551 C9.1753425,55.302362 4.75634063,55.3267739 2.04596125,52.6380763 C-0.664418119,49.9493786 -0.639809431,45.5657266 2.10092618,42.8469156 L12.2188173,32.8099628 L2.07175952,22.7440766 C-0.668976163,20.0252655 -0.693584805,15.6416135 2.01679457,12.9529159 C4.72717394,10.2642183 9.14617576,10.2886301 11.8869114,13.0074412 L26.9835072,27.9832715 C29.6820777,30.6602547 29.7063078,34.9764657 27.0376266,37.6237989 L22.0545494,42.5670137 L22.0339692,42.5465982 Z" id="Arrow"></path>
            //             //                     </g>
            //             //                     <g id="Logo" transform="translate(31.000000, 75.000000) scale(-1, 1) translate(-31.000000, -75.000000) translate(0.000000, 43.000000)" fill="#7F879D" fill-rule="nonzero">
            //             //                       <path d="M54.9182725,41.8758399 L34.6840139,61.948234 C31.9371262,64.6731479 27.4959505,64.685458 24.7643707,61.9757295 C22.0327907,59.2660009 22.0452001,54.8603525 24.7920877,52.1354387 L45.0263463,32.0630445 L24.6649821,11.8645614 C21.9180943,9.1396475 21.9056849,4.73399923 24.6372649,2.02427059 C27.3688449,-0.685458001 31.8100205,-0.673147961 34.5569081,2.05176596 L59.9635087,27.2551259 C62.6681366,29.9381181 62.680355,34.275987 59.9907994,36.9440276 L54.9687445,41.9259083 L54.9182725,41.8758399 Z M22.0339692,42.5465982 L11.9160781,52.583551 C9.1753425,55.302362 4.75634063,55.3267739 2.04596125,52.6380763 C-0.664418119,49.9493786 -0.639809431,45.5657266 2.10092618,42.8469156 L12.2188173,32.8099628 L2.07175952,22.7440766 C-0.668976163,20.0252655 -0.693584805,15.6416135 2.01679457,12.9529159 C4.72717394,10.2642183 9.14617576,10.2886301 11.8869114,13.0074412 L26.9835072,27.9832715 C29.6820777,30.6602547 29.7063078,34.9764657 27.0376266,37.6237989 L22.0545494,42.5670137 L22.0339692,42.5465982 Z" id="Arrow"></path>
            //             //                     </g>
            //             //                   </g>
            //             //                 </svg>`;
            //             // }
            // if (hallPass.travel_type === 'both') {
            //   travelType = `<img src="./assets/SP Arrow Double (Blue-Gray).svg" width="25">`;
            // }
            const reportDate = new Date(hallPass.created);
            const time = reportDate.getHours() <= 12
              ?
              `${reportDate.getHours()}:${reportDate.getMinutes() < 10 ? '0' : ''}${reportDate.getMinutes()} ${reportDate.getHours() === 12 ? 'PM' : 'AM'}`
              :
              `${reportDate.getHours() - 12}:${reportDate.getMinutes() < 10 ? '0' : ''}${reportDate.getMinutes()} PM`;
            const prettyReportDate = `${reportDate.getMonth() + 1}/${reportDate.getDate()}  ${time}`;
            const diff: number = (new Date(hallPass.end_time).getTime() - new Date(hallPass.start_time).getTime()) / 1000;
            const mins: number = Math.floor(Math.floor(diff) / 60);
            const secs: number = Math.abs(Math.floor(diff) % 60);
            const duration = mins + (secs === 0 ? '' : ':') + (secs === 0 ? '' : secs < 10 ? '0' + secs : secs) + ' min';
            const name = hallPass.student.first_name + ' ' + hallPass.student.last_name +
                ` (${hallPass.student.primary_email.split('@', 1)[0]})`;
            const passes = {
                'Student Name': name,
                'Origin': hallPass.origin.title,
                'TT': hallPass.travel_type,
                'Destination': hallPass.destination.title,
                'Date & Time': prettyReportDate,
                'Duration': duration
            };
            Object.defineProperty(passes, 'id', { enumerable: false, value: hallPass.id});
            Object.defineProperty(passes, 'date', {enumerable: false, value: moment(hallPass.created) });
            Object.defineProperty(passes, 'sortDuration', {enumerable: false, value: moment.duration(moment(hallPass.end_time).diff(moment(hallPass.start_time))) });
            return passes;
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
                this.selectedDate = {start: date.start, end: date.end};
            }
        });
  }

  selectedPass(pass) {
    const selectedPass: HallPass = _.find<HallPass>(this.passes, {id: pass['id']});
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
          panelClass: 'teacher-pass-card-dialog-container',
          backdropClass: 'custom-backdrop',
          data: data,
      });
  }

  resetSearchState() {
    this.tableData = [];
    this.selectedReport = [];
    this.hasSearched = false;
  }

  previewPDF(event) {
    const data = this.selectedReport.length ? this.selectedReport : this.tableData;
    if (data.length > 0) {
      const _selectedReport = data.map((row) => {
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
        prettyFrom = DatePrettyHelper.transform(this.selectedDate.start.toDate());
        prettyTo = DatePrettyHelper.transform(this.selectedDate.end.toDate());
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
