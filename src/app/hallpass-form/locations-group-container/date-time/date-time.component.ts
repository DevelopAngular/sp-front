import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent implements OnInit {

  startTime: Date = new Date();
  requestTime: Date = new Date();

  constructor(private router: Router) { }

  ngOnInit() {
  }

  next() {
  }

}
