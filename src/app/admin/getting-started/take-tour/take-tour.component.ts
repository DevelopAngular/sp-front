import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AdminService} from '../../../services/admin.service';

declare const window;

@Component({
  selector: 'app-take-tour',
  templateUrl: './take-tour.component.html',
  styleUrls: ['./take-tour.component.scss']
})
export class TakeTourComponent implements OnInit {

  constructor(
    public router: Router,
    private adminService: AdminService
  ) { }

  ngOnInit() {
  }

  openUrl(url) {
    window.open(url);
  }

}
