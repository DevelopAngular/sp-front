import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../../services/admin.service';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {GettingStartedProgressService} from '../../getting-started-progress.service';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs';

declare const window;

@Component({
  selector: 'app-take-tour',
  templateUrl: './take-tour.component.html',
  styleUrls: ['./take-tour.component.scss']
})
export class TakeTourComponent implements OnInit {

  student: any;
  teacher: any;

  constructor(
    public router: Router,
    private adminService: AdminService,
    public darkTheme: DarkThemeSwitch,
    private gsProgress: GettingStartedProgressService
  ) { }

  ngOnInit() {
    this.adminService.onboardProcessData$
      .pipe(
        map(data => this.gsProgress.buildProcessData(data)),
        filter(op => op.take_a_tour),
        switchMap((op: any) => {
            if (!op.take_a_tour.create_accounts.value) {
              return this.gsProgress.updateProgress('take_a_tour:create_accounts');
            } else {
              this.student = {
                name: op.take_a_tour.create_accounts.data.student.display_name,
                username: op.take_a_tour.create_accounts.data.student.username,
                password:  op.take_a_tour.create_accounts.data.student_password
              };
              this.teacher = {
                name: op.take_a_tour.create_accounts.data.teacher.display_name,
                username: op.take_a_tour.create_accounts.data.teacher.username,
                password:  op.take_a_tour.create_accounts.data.teacher_password
              };
              return of(op);
            }
          return of(op);
        }),
        switchMap((op) => {
          if (!op.take_a_tour.end.value) {
            return this.gsProgress.updateProgress('take_a_tour:end');
          }
          return of(op);
        })
      )
      .subscribe(op => {

      });
  }

  openUrl(url) {
    window.open(url);
  }

}
