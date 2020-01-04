import { Injectable } from '@angular/core';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {AdminService} from '../services/admin.service';
import {HttpService} from '../services/http-service';
import {BehaviorSubject} from 'rxjs';

export interface OnboardItem {
  done: string;
  extras: {};
  id: number;
  name: string;
}

export enum Progress {
  'create_school:start' = 5,
  'create_school:end' = 5,
  'take_a_tour:start' = 10,
  'take_a_tour:create_accounts' = 10,
  'take_a_tour:end' = 10,
  'setup_rooms:start' = 10,
  'setup_rooms:end' = 10,
  'setup_accounts:start' = 15,
  'setup_accounts:end' = 15,
  'launch_day_prep:start' = 5,
  'launch_day_prep:end' = 5,
}
export interface ProgressInterface {
  'create_school:start': 5;
  'create_school:end': 5;
  'take_a_tour:start': 10;
  'take_a_tour:create_accounts': 10;
  'take_a_tour:end': 10;
  'setup_rooms:start': 10;
  'setup_rooms:end': 10;
  'setup_accounts:start': 15;
  'setup_accounts:end': 15;
  'launch_day_prep:start': 5;
  'launch_day_prep:end': 5;
}


@Injectable()
export class GettingStartedProgressService {

  private onboardProgress: {
    progress: number,
    offset: number
    take_a_tour?: any,
    launch_day_prep?: any,
    setup_rooms?: any,
    setup_accounts?: any,
    create_school?: any
  } = {
    progress: 0,
    offset: 130
  };

  private onboardProgressSubject: BehaviorSubject<{
    progress: number,
    offset: number
    take_a_tour?: any,
    launch_day_prep?: any,
    setup_rooms?: any,
    setup_accounts?: any,
    create_school?: any
  }> = new BehaviorSubject(this.onboardProgress);

  public onboardProgress$ = this.onboardProgressSubject.asObservable();

  constructor(
    private adminService: AdminService,
    private httpService: HttpService
  ) {
    this.httpService.globalReload$
      .pipe(
        switchMap(() => {
          return this.adminService.getOnboardProcessRequest();
        })
      )
      .pipe(
        filter((res: any[]) => !!res.length),
        map((data: Array<OnboardItem>) => {
          return this.buildProcessData(data);
        })
      )
      .subscribe((op) => {
        this.onboardProgressSubject.next(op as any);
      });
  }

  buildProcessData(data: Array<OnboardItem>) {
    this.onboardProgress.progress = 0;
    this.onboardProgress.offset = 130;
    data.forEach((item: OnboardItem ) => {
      const ticket = item.name.split(':');
      if (!this.onboardProgress[ticket[0]]) {
        this.onboardProgress[ticket[0]] = {};
      }
      this.onboardProgress[ticket[0]][ticket[1]] = {
        value: !!item.done,
        data: item.extras
      };
      if (item.done) {
        this.onboardProgress.progress += Progress[item.name];
        this.onboardProgress.offset -= Progress[item.name];
      }
    });
    if (this.onboardProgress.progress === 100) {
      this.onboardProgress.offset = 0;
    }
    return this.onboardProgress;
  }

  updateProgress(ticket) {
    this.adminService.updateOnboardProgressRequest(ticket);
    return this.adminService.getOnboardProcessRequest()
      .pipe(
        filter(res => !!res.length),
        map((data) => {
          return this.buildProcessData(data);
        })
      );
  }

}
