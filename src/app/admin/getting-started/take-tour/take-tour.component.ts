import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../../services/admin.service';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {switchMap} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
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
        if (!op.take_a_tour.create_accounts) {
          this.adminService.updateOnboardProgress('take_a_tour:create_accounts').subscribe();
        }
        if (!op.take_a_tour.end) {
          this.adminService.updateOnboardProgress('take_a_tour:end').subscribe();
        }
      }
    });

  }

  openUrl(url) {
    window.open(url);
  }

}
