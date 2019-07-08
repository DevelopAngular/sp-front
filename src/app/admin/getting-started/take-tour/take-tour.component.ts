import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../../services/admin.service';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {switchMap} from 'rxjs/operators';
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
  ) { }

  ngOnInit() {
    this.adminService.getOnboardProgress().pipe(switchMap((onboard: any[]) => {
      const end = onboard.find(item => item.name === 'take_a_tour:end');

      if (!end.done) {
        return this.adminService.updateOnboardProgress('take_a_tour:end');
      } else {
          return of(null);
      }
    })).subscribe();
  }

  openUrl(url) {
    window.open(url);
  }

}
