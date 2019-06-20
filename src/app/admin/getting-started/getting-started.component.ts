import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {AdminService} from '../../services/admin.service';

export interface OnboardItem {
  done: string;
  extracts: {};
  id: number;
  name: string;
}

export enum Progress {
  'take_a_tour:start' = 15,
  'take_a_tour:end' = 15,
  'setup_rooms:start' = 10,
  'setup_rooms:end' = 10,
  'setup_accounts:start' = 15,
  'setup_accounts:end' = 15,
  'launch_day_prep:start' = 5,
  'launch_day_prep:end' = 5,
}

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {

  progress = 10;
  offset = 120;

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.adminService.getOnboardProgress().subscribe((data: Array<OnboardItem>) => {
      console.log(data);



      data.forEach((item: OnboardItem ) => {
        if (item.done) {
          this.progress += Progress[item.name];
        }
      });

    });
  }
  increase() {
    this.offset -= 20;
  }
}
