import { Component, OnInit } from '@angular/core';

import 'rxjs/add/operator/map';
import { GoogleLoginService } from '../google-login.service';
import {User} from '../models/User';
import {ActivatedRoute} from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

    public currentUser: User;

    constructor(
        public userService: UserService,
        private route: ActivatedRoute
    ) {

    }

    ngOnInit() {
        this.route.data.subscribe((_resolved: any) => {
            this.currentUser =_resolved.currentUser;
            console.log(this.currentUser);
        });
    }

    shouldShowRouter() {
      return this.userService.userData.map(u => u.isStudent() || u.isTeacher());
    }
}
