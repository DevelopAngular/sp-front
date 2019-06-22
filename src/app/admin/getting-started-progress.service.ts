import { Injectable } from '@angular/core';
import {publish, share, switchMap} from 'rxjs/operators';
import {AdminService} from '../services/admin.service';
import {HttpService} from '../services/http-service';

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
export interface ProgressInterface {
  'take_a_tour:start': 15;
  'take_a_tour:end': 15;
  'setup_rooms:start': 10;
  'setup_rooms:end': 10;
  'setup_accounts:start': 15;
  'setup_accounts:end': 15;
  'launch_day_prep:start': 5;
  'launch_day_prep:end': 5;
}


@Injectable()
export class GettingStartedProgressService {

  public onboardProgress: {
    progress: number,
    offset: number
    take_a_tour?: any,
    launch_day_prep?: any,
    setup_rooms?: any,
    setup_accounts?: any,
  } = {
    progress: 0,
    offset: 120
  };

  constructor(
    private adminService: AdminService,
    private httpService: HttpService
  ) {
    this.httpService.globalReload$
      .pipe(
        switchMap(() => {
          return this.adminService.getOnboardProgress();
        })
      )
      .subscribe((data: Array<OnboardItem>) => {
        console.log(data);
        this.onboardProgress.progress = 10;
        this.onboardProgress.offset = 120;
        data.forEach((item: OnboardItem ) => {
          const ticket = item.name.split(':');
          if (!this.onboardProgress[ticket[0]]) {
            this.onboardProgress[ticket[0]] = {};
          }
          this.onboardProgress[ticket[0]][ticket[1]] = item.done;
          if (item.done) {
            this.onboardProgress.progress += Progress[item.name];
            this.onboardProgress.offset -= Progress[item.name];
            console.log(this.onboardProgress.progress, Progress[item.name]);
          }
        });
        console.log(this.onboardProgress);
      });
  }

  updateProgress(ticket: keyof ProgressInterface ) {
    this.adminService.updateOnboardProgress(ticket).subscribe(() => this.httpService.setSchool(this.httpService.getSchool()));
  }

}