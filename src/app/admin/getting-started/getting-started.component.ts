import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {AdminService} from '../../services/admin.service';
import {HttpService} from '../../services/http-service';
import {GettingStartedProgressService} from '../getting-started-progress.service';

// export interface OnboardItem {
//   done: string;
//   extracts: {};
//   id: number;
//   name: string;
// }

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {

  // progress = 10;
  // offset = 120;

  // onboardProgress: {
  //   progress: number,
  //   offset: number
  //   take_a_tour?: any,
  //   launch_day_prep?:any,
  //     setup_rooms?: any,
  //     setup_accounts?:any,
  // } = {
  //     progress: 0,
  //     offset: 120
  // };

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private adminService: AdminService,
    private httpService: HttpService,
    public gsProgress: GettingStartedProgressService
  ) { }

  ngOnInit() {
    // this.httpService.globalReload$.pipe(
    //   // switchMap(() => {
    //   //   return this.adminService.getOnboardProgress();
    //   // })
    // )
    // .subscribe((data: Array<OnboardItem>) => {
    //   console.log(data);
    //   this.onboardProgress.progress = 10;
    //   this.onboardProgress.offset = 120;
    //   data.forEach((item: OnboardItem ) => {
    //     const ticket = item.name.split(':');
    //     if (!this.onboardProgress[ticket[0]]) {
    //       this.onboardProgress[ticket[0]] = {};
    //     }
    //     this.onboardProgress[ticket[0]][ticket[1]] = item.done;
    //     if (item.done) {
    //       this.onboardProgress.progress += Progress[item.name];
    //       this.onboardProgress.offset -= Progress[item.name];
    //       console.log(this.onboardProgress.progress, Progress[item.name]);
    //     }
    //   });
    //   console.log(this.onboardProgress);
    // });
  }
  increase() {
    // this.onboardProgress.offset -= 20;
  }
}
