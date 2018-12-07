import { Component, OnInit } from '@angular/core';

import 'rxjs/add/operator/map';
import { GoogleLoginService } from '../google-login.service';
import {User} from '../models/User';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

    public currentUser: User;

    constructor(
        public loginService: GoogleLoginService,
        private route: ActivatedRoute
    ) {

    }

    ngOnInit() {
        this.route.data.subscribe((_resolved: any) => {
            this.currentUser =_resolved.currentUser;
            console.log(this.currentUser);
        });
    }

    isTeacher() {
      return true;

      // TODO when the roles of teachers will be ready
        // return this.currentUser.roles.includes('_profile_teacher');
    }
}
