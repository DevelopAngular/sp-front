import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {HttpService} from '../../services/http-service';
import {Observable, of} from 'rxjs';
import {School} from '../../models/School';
import {AdminService} from '../../services/admin.service';
import {filter, mapTo, switchMap} from 'rxjs/operators';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {CalendarComponent} from '../calendar/calendar.component';
import {bumpIn} from '../../animations';

import * as moment from 'moment';

declare const window;

@Component({
  selector: 'app-my-school',
  templateUrl: './my-school.component.html',
  styleUrls: ['./my-school.component.scss'],
  animations: [bumpIn]
})
export class MySchoolComponent implements OnInit, AfterViewInit {

  currentSchool$: Observable<School>;

  selectedDate: moment.Moment;

  buttons = [
      { title: 'Quick Start Guides', description: 'Short how-to guides for students and teachers.', link: 'https://www.smartpass.app/support/quickstartguides' },
      { title: 'Community Letter', description: 'Perfect for school community announcements', link: 'https://www.smartpass.app/support/communityletter' },
      { title: 'Hallway Posters', description: 'Printable posters to remind students to use SmartPass.', link: 'https://www.smartpass.app/support/hallwayposters' },
      { title: 'Launchpad Logo', description: 'Put a link to SmartPass on your student launchpad.', link: 'https://www.smartpass.app/support/launchpadlogo' },

  ];

  buttonDown: boolean;

  openSchoolPage: boolean;

  constructor(
      private http: HttpService,
      private adminService: AdminService,
      public darkTheme: DarkThemeSwitch,
      private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.currentSchool$ = this.http.currentSchool$;
      this.adminService.getOnboardProcessRequest().pipe(
        filter((res: any[]) => !!res.length),
        switchMap((res: any[]) => {
        const start = res.find(setting => setting.name === 'launch_day_prep:start');
        if (!start.done) {
          return this.adminService.updateOnboardProgress(start.name).pipe(mapTo(res));
        } else {
          return of(res);
        }
      }),
        switchMap((res: any[]) => {
            const end = res.find(setting => setting.name === 'launch_day_prep:end');
            if (!end.done) {
              return this.adminService.updateOnboardProgress(end.name);
            } else {
              return of(null);
            }
        })).subscribe();
  }
  ngAfterViewInit(): void {
    // window.appLoaded();
  }

  redirect(button) {
    window.open(button.link);
  }

  openCalendar(event) {
      const target = new ElementRef(event.currentTarget);
      const DR = this.dialog.open(CalendarComponent, {
          panelClass: 'calendar-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {
              'trigger': target,
          }
      });

      DR.afterClosed().subscribe(res => {
          this.selectedDate = moment(res.date);
      });
  }
}
