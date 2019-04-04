import { Component, OnInit } from '@angular/core';

import { UserService } from '../services/user.service';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(
    public userService: UserService,
    private createFormService: CreateFormService
  ) {
  }

  ngOnInit() {
    this.createFormService.seen();
  }

    isTeacher() {
        return true;
      // TODO when the roles of teachers will be ready
      //   return this.currentUser.roles.includes('_profile_teacher');
    }

  shouldShowRouter() {
    return this.userService.userData.pipe(map(u => u.isStudent() || u.isTeacher()));
  }

}
