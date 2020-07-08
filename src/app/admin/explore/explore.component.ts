import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {MatDialog} from '@angular/material';
import {PagesDialogComponent} from './pages-dialog/pages-dialog.component';
import {filter} from 'rxjs/operators';
import {StudentFilterComponent} from './student-filter/student-filter.component';
import {User} from '../../models/User';
import {SearchCalendarComponent} from './search-calendar/search-calendar.component';
import {CustomTableColumns} from '../custom-table/custom-table.component';
import {HallPass} from '../../models/HallPass';
import * as moment from 'moment';
import {HallPassesService} from '../../services/hall-passes.service';

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

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreComponent implements OnInit {

  views: View = {
    'pass_search': {id: 1, title: 'Pass Search', color: '#00B476', icon: 'Pass Search', action: 'pass_search'},
    'report_search': {id: 2, title: 'Reports search', color: 'red', icon: 'Report Search', action: 'report_search'},
    'contact_trace': {id: 3, title: 'Contact trace', color: '#139BE6', icon: 'Contact Trace', action: 'contact_trace'},
    'rooms_usage': {id: 4, title: 'Rooms Usage', color: 'orange', icon: 'Rooms Usage', action: 'rooms_usage'}
  };
  selectedStudents: User[];
  selectedDate: { start: moment.Moment, end: moment.Moment };
  selectedRooms: any[];

  searchedPassData$: Observable<{[id: number]: HallPass}>;

  currentView$: BehaviorSubject<string> = new BehaviorSubject<string>('pass_search');

  constructor(
    private dialog: MatDialog,
    private hallPassService: HallPassesService,
    private cdr: ChangeDetectorRef
    ) { }

  ngOnInit() {
    this.searchedPassData$ = this.hallPassService.passesEntities$;
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
    if (action === 'students') {
      const studentFilter = this.dialog.open(StudentFilterComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'trigger': event.currentTarget,
          'selectedStudents': this.selectedStudents
        }
      });

      studentFilter.afterClosed()
        .pipe(filter(res => res))
        .subscribe(students => {
          this.selectedStudents = students;
          this.cdr.detectChanges();
        });
    } else if (action === 'calendar') {
      const calendar = this.dialog.open(SearchCalendarComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: { 'trigger': event.currentTarget }
      });
    }
  }

  displayedColumns(page_id: number): CustomTableColumns {
    if (page_id === SearchPages.search) {
      return {
        1: { sortBy: 'asc', title: 'Pass', field: 'icon' },
        2: { sortBy: 'asc', title: 'Student Name', field: 'student'},
        3: { sortBy: 'asc', title: 'Origin', field: 'origin'},
        4: { sortBy: 'asc', title: 'Destination', field: 'destination'},
        5: { sortBy: 'asc', title: 'Pass start time', field: 'start_time'},
        6: { sortBy: 'asc', title: 'Duration', field: 'duration'}
      };
    }
  }

  search() {
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

    this.hallPassService.searchPassesRequest(url);
  }

}
