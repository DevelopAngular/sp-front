import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../../services/admin.service';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {GettingStartedProgressService} from '../../getting-started-progress.service';

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
    this.gsProgress.onboardProgress$.subscribe((op: any) => {
      if (op.take_a_tour) {
        if (!op.take_a_tour.create_accounts.value) {
          this.adminService.updateOnboardProgress('take_a_tour:create_accounts').subscribe();
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
        }
        if (!op.take_a_tour.end.value) {
          this.adminService.updateOnboardProgress('take_a_tour:end').subscribe();
        }
      }
    });
  }

  openUrl(url) {
    window.open(url);
  }

}
