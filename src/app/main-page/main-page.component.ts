import { Component, OnInit } from '@angular/core';

import { UserService } from '../user.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(
    public userService: UserService
  ) {
  }

  ngOnInit() {
  }

  shouldShowRouter() {
    return this.userService.userData.map(u => u.isStudent() || u.isTeacher());
  }
}
