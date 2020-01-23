import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {HttpService} from '../../services/http-service';
import {Observable, of, Subject} from 'rxjs';
import {School} from '../../models/School';
import {AdminService} from '../../services/admin.service';
import {filter, map, mapTo, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {SchoolSettingsComponent} from './school-settings/school-settings.component';

import {bumpIn} from '../../animations';
import * as moment from 'moment';

declare const window;

@Component({
  selector: 'app-my-school',
  templateUrl: './my-school.component.html',
  styleUrls: ['./my-school.component.scss'],
  animations: [bumpIn]
})
export class MySchoolComponent implements OnInit, OnDestroy {

  currentSchool: School;

  selectedDate: moment.Moment;

  buttons = [
      { title: 'Quick Start Guides', description: 'Short how-to guides for students and teachers.', link: 'https://www.smartpass.app/support/quickstartguides' },
      { title: 'Community Letter', description: 'Perfect for school community announcements', link: 'https://www.smartpass.app/support/communityletter' },
      { title: 'Hallway Posters', description: 'Printable posters to remind students to use SmartPass.', link: 'https://www.smartpass.app/support/hallwayposters' },
      { title: 'Launchpad Logo', description: 'Put a link to SmartPass on your student launchpad.', link: 'https://www.smartpass.app/support/launchpadlogo' },

  ];

  buttonDown: boolean;
  process$: Observable<any>;

  openSchoolPage: boolean;
  updateProgress$: Subject<boolean> = new Subject<boolean>();
  updateLaunchDate$: Subject<boolean> = new Subject<boolean>();
  launchDay: moment.Moment;
  countLaunchDay: number;
  loaded: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private http: HttpService,
      private adminService: AdminService,
      public darkTheme: DarkThemeSwitch,
      private dialog: MatDialog,
  ) { }

  get isLaunched() {
    return this.selectedDate && moment().isSameOrAfter(this.selectedDate, 'day');
  }

  ngOnInit() {
    // this.currentSchool = this.http.currentSchoolSubject.value;
    this.http.globalReload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.http.currentSchoolSubject;
      }),
      tap((school: School) => {
        this.currentSchool = school;
        this.selectedDate = moment(this.currentSchool.launch_date);
        this.buildLaunchDay();
      }),
      switchMap(() => this.adminService.onboardProcessData$),
      filter((res: any[]) => !!res.length),
      switchMap((res: any[]) => {
        const start = res.find(setting => setting.name === 'launch_day_prep:start');
        const end = res.find(setting => setting.name === 'launch_day_prep:end');
        if (!start.done) {
          return this.adminService.updateOnboardProgress(start.name);
        } else if (!!start.done && !!end.done) {
          this.openSchoolPage = true;
          return of(true);
        }
        this.openSchoolPage = false;
        return of(null);
      })
    ).subscribe(() => {
        this.loaded = true;
    });

    this.updateProgress$
      .pipe(
        filter(res => !!res),
        switchMap(isOpen => {
          return this.adminService.onboardProcessData$;
        }),
        switchMap((res: any[]) => {
          const end = res.find(setting => setting.name === 'launch_day_prep:end');
          if (!end.done) {
            return this.adminService.updateOnboardProgress(end.name);
          } else {
            return of(null);
          }
        })
      ).subscribe();

    this.updateLaunchDate$
      .pipe(
        switchMap(() => {
          return this.adminService.updateSchoolSettingsRequest(this.currentSchool, {launch_date: this.selectedDate.toISOString()});
        }),
        filter(res => !!res)
      )
      .subscribe(res => {
      this.http.currentSchoolSubject.next(res);
      this.buildLaunchDay();
      this.updateProgress$.next(true);
    });
  }

  buildLaunchDay() {
    this.launchDay = moment(this.currentSchool.launch_date);
    this.countLaunchDay = this.launchDay.diff(moment(), 'days');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selected(date) {
    this.selectedDate = date;
    this.updateLaunchDate$.next(true);
  }

  saveRequest() {
    this.openSchoolPage = true;
    this.updateLaunchDate$.next(true);
  }

  redirect(button) {
    window.open(button.link);
  }

  openSettings() {
      const setDialog = this.dialog.open(SchoolSettingsComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-bd'
      });
  }

}
