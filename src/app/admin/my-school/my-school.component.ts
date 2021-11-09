import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpService} from '../../services/http-service';
import {Subject} from 'rxjs';
import {School} from '../../models/School';
import {AdminService} from '../../services/admin.service';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {SchoolSettingsComponent} from './school-settings/school-settings.component';

import {bumpIn} from '../../animations';
import * as moment from 'moment';
import {SupportService} from '../../services/support.service';
import {StudentInfoCardComponent} from '../../student-info-card/student-info-card.component';
import {UserService} from '../../services/user.service';
import {User} from '../../models/User';

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

  openSchoolPage: boolean;
  launchDay: moment.Moment;
  countLaunchDay: number;
  loaded: boolean;

  user: User;

  chatBackdrop: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
      private http: HttpService,
      private adminService: AdminService,
      public darkTheme: DarkThemeSwitch,
      private dialog: MatDialog,
      private supportService: SupportService,
      private userService: UserService
  ) {
  }

  get isLaunched() {
    return this.selectedDate && moment().isSameOrAfter(this.selectedDate, 'day');
  }

  ngOnInit() {
    this.userService.user$.subscribe(r => {
      this.user = r;
    });
    this.http.globalReload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.http.currentSchoolSubject;
      }),
      tap((school: School) => {
        this.currentSchool = school;
      }),
    ).subscribe(() => {
        this.loaded = true;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  redirect(button) {
    window.open(button, '_blank');
  }

  openSettings() {
    const setDialog = this.dialog.open(SchoolSettingsComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd'
    });
  }

  openChat(event) {
    this.supportService.openChat(event);
  }

  closeChat(event) {
    this.supportService.closeChat(event);
  }

  opentest() {
    this.dialog.open(StudentInfoCardComponent, {
      panelClass: 'student-pass-info-dialog',
      data: {profile: this.user}
    });
  }

}
