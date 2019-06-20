import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {AdminService} from '../../services/admin.service';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {
  offset = 120;
  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.adminService.getOnboardProgress().subscribe((data) => {
      console.log(data);
    })
  }
  increase() {
    this.offset -= 20;
  }
}
