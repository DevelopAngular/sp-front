import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar-components',
  templateUrl: './calendar-components.component.html',
  styleUrls: ['./calendar-components.component.scss']
})
export class CalendarComponentsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  result(event) {
    console.log('Admin calendar result ===>>>', event);
  }

}
