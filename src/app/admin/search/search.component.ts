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
import { Util } from '../../../Util';
import {HallPassesService} from '../../services/hall-passes.service';
import {XlsxGeneratorService} from '../xlsx-generator.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {of, Subscription} from 'rxjs';
import {DataService} from '../../services/data-service';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {FormGroup} from '@angular/forms';
import {SearchFilterDialogComponent} from "./search-filter-dialog/search-filter-dialog.component";


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
  passes: HallPass[];

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
      private dataService: DataService,
      public darkTheme: DarkThemeSwitch

  ) {
  }

  get isDisabled() {
    return !this.selectedStudents.length && !this.selectedDate && !this.selectedRooms.length && !this.hasSearched || this.spinner;
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
    if (this.selectedStudents.length || this.selectedDate || this.selectedRooms.length || query) {
      this.sortParamsHeader = `All Passes, Searching by ${(this.selectedStudents && this.selectedStudents.length > 0 ? 'Student Name' : '') + (this.selectedDate && this.selectedDate !== '' ? ', Date & Time' : '') + (this.selectedRooms && this.selectedRooms.length > 0 ? ', Room Name' : '')}`;
      this.spinner = true;
      this.selectedReport = [];
      let url = 'v1/hall_passes?' + query;
      if (this.selectedRooms) {
        console.log('Has rooms\t', this.roomSearchType);
        if (this.roomSearchType == 'Origin') {
          let origins: any[] = this.selectedRooms.map(r => r['id']);

          Array.from(Array(origins.length).keys()).map(i => {
            url += 'origin=' + origins[i] + '&';
          });
        }

        if (this.roomSearchType == 'Destination') {
          let destinations: any[] = this.selectedRooms.map(r => r['id']);

          Array.from(Array(destinations.length).keys()).map(i => {
            url += 'destination=' + destinations[i] + '&';
          });
        }

        if (this.roomSearchType == 'Either') {
          let locations: any[] = this.selectedRooms.map(r => r['id']);

          Array.from(Array(locations.length).keys()).map(i => {
            url += 'location=' + locations[i] + '&';
          });
        }
      }
      console.log('[Selected Students]:', this.selectedStudents)
      if (this.selectedStudents) {
        let students: any[] = this.selectedStudents.map(s => s['id']);

        Array.from(Array(students.length).keys()).map(i => {
          url += 'student=' + students[i] + '&';
        });
      }

      if (this.selectedDate) {
        let start;
        let end;
        if(this.selectedDate['from']){
          start = this.selectedDate['from'].toISOString();
          url += (start ? ('created_after=' + start + '&') : '');
        }
        if(this.selectedDate['to']){
          end = this.selectedDate['to'].toISOString();
          url += (end ? ('end_time_before=' + end) : '');
        }

        console.log('Start: ', start, '\nEnd: ', end);

      }

      this.hallPassService.searchPasses(url).pipe(filter(res => !!res))
        .subscribe((data: HallPass[]) => {

          console.log('DATA', data);
          this.passes = data;
          this.tableData = data.map(hallPass => {
            let travelType;
            if (hallPass.travel_type === 'one_way') {
              travelType = 'One Way';
            }
            if (hallPass.travel_type === 'round_trip') {
              travelType = 'Round Trip';
            }
            if (hallPass.travel_type === 'both') {
              travelType = 'Both';
            }
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
                'Destination': hallPass.destination.title,
                'Travel Type': travelType,
                'Date & Time': prettyReportDate,
                'Duration': duration
            };
            Object.defineProperty(passes, 'id', { enumerable: false, value: hallPass.id});
            return passes;
          });
          this.spinner = false;
          this.hasSearched = true;
        });

    }
  }

  openFilters(state: string) {
    const filterRef = this.dialog.open(SearchFilterDialogComponent, {
        panelClass: 'form-dialog-container',
        backdropClass: 'custom-backdrop',
        data: { state, students: this.selectedStudents }
    });

    filterRef.afterClosed().pipe(filter(data => !!data)).subscribe(data => {
      if (data.action === 'students') {
        this.selectedStudents = data.students;
      }
    });
  }

  dateEmit(date) {
    //console.log('Selected Date:', this.selectedDate, '-> Date:', date, 'Selected Rooms:', this.selectedRooms, 'Selected Students:', this.selectedStudents);
    console.log(date);
    this.selectedDate = date?date:this.selectedDate;
  }

  roomEmit(rooms) {
    //console.log('Selected Date:', this.selectedDate, 'Selected Rooms:', this.selectedRooms, '-> Rooms:', rooms, 'Selected Students:', this.selectedStudents);
    console.log(rooms);
    this.selectedRooms = rooms?rooms:this.selectedRooms;
  }

  studentsEmit(students) {
    //console.log('Selected Date:', this.selectedDate, 'Selected Rooms:', this.selectedRooms, 'Selected Students:', this.selectedStudents, '-> Students:', students);
    console.log(students);
    this.selectedStudents = students ? students : this.selectedStudents;
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
    console.log(this.selectedReport);
    if (this.selectedReport.length > 0) {
      const _selectedReport = this.selectedReport.map((row) => {
        const _copy = {};
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            _copy[key] = typeof row[key] !== 'string' ? row[key] + ' min' : row[key];
          }
        }
        return _copy;
      });

      let prettyFrom = '';
      let prettyTo = '';
      if (this.selectedDate) {
        prettyFrom = DatePrettyHelper.transform(this.selectedDate.from);
        prettyTo = DatePrettyHelper.transform(this.selectedDate.to);
      }
      let rooms = '';
      if (this.selectedRooms) {
        rooms = this.selectedRooms.map((room) => {
          return room.title;
        }).join(', ');
      }

      const title = `${this.sortParamsHeader}: ${this.selectedDate ? `from ${prettyFrom} to ${prettyTo};` : ''} ${this.selectedRooms ? rooms : ''}`;


      console.log('_selectedReport', _selectedReport);
      this.pdf.generateReport(_selectedReport, 'l', 'search', title);
    } else {
      event.preventDefault();
    }
  }

}
