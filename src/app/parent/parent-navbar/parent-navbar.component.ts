import { Component, OnInit } from '@angular/core';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { User } from '../../models/User';
import { RepresentedUser } from '../../navbar/navbar.component';

@Component({
  selector: 'app-parent-navbar',
  templateUrl: './parent-navbar.component.html',
  styleUrls: ['./parent-navbar.component.scss']
})
export class ParentNavbarComponent implements OnInit {

  user: User;
  representedUsers: RepresentedUser[];
  effectiveUser: RepresentedUser;

  constructor(
    public darkTheme: DarkThemeSwitch,
  ) { }

  ngOnInit(): void {
  }

}
