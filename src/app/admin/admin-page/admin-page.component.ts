import { Component, OnInit } from '@angular/core';
import { GoogleLoginService } from '../../google-login.service';
import {User} from '../../models/User';
import { ActivatedRoute } from '@angular/router';
import {ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {

  public outletDummySwitcher$: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  public currentUser: User;

  constructor(
    public loginService: GoogleLoginService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.route.data.subscribe((_resolved: any) => {
      this.currentUser = _resolved.currentUser;
      // console.log(this.currentUser);
    });
  }
  isAdmin() {
    return this.currentUser.roles.includes('_profile_admin');
  }
  hideOutlet(event: boolean) {
    this.outletDummySwitcher$.next(event);
  }
}
