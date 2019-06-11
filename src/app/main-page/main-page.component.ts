import {Component, HostListener, OnInit} from '@angular/core';

import {UserService} from '../services/user.service';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {map} from 'rxjs/operators';
import {ScreenService} from '../services/screen.service';
import {SideNavService} from '../services/side-nav.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(
    public userService: UserService,
    private createFormService: CreateFormService,
    private screenService: ScreenService,
    private sideNavService: SideNavService
  ) {
  }

  toggle: Observable<boolean> = new Observable<boolean>();
  data: any;

  ngOnInit() {
    this.createFormService.seen();
    this.toggle = this.sideNavService.toggle;
  }

  isTeacher() {
    return true;
    // TODO when the roles of teachers will be ready
    //   return this.currentUser.roles.includes('_profile_teacher');
  }

  shouldShowRouter() {
    return this.userService.userData.pipe(map(u => u.isStudent() || u.isTeacher() || u.isAssistant()));
  }

  onSettingClick($event) {
    if (this.screenService.isDeviceLargeExtra) {
      this.data = $event;
      this.sideNavService.toggle$.next(true);
    }
  }

  fadeClick() {
    this.sideNavService.toggle$.next(false);
    this.sideNavService.sideNavAction$.next('');
  }

  @HostListener('window:resize')
  checkWidth() {
    if (!this.screenService.isDeviceLargeExtra) {
      this.sideNavService.toggle$.next(false);
    }
  }

}
