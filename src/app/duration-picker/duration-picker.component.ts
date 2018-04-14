import { Component, OnInit} from '@angular/core';
import {Duration} from '../models';

@Component({
  selector: 'app-duration-picker',
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.css']
})

export class DurationPickerComponent implements OnInit {
  durations: Duration[] = [
                          new Duration('3 minutes', 180000),
                          new Duration('5 minutes', 300000),
                          new Duration('10 minutes', 600000),
                          new Duration('15 minutes', 900000),
                          new Duration('30 minutes', 1800000)
                        ];
  public selectedDuration: Promise<Duration>;
  constructor() { }

  ngOnInit() {
  }

  validate(){
    return this.selectedDuration instanceof Duration;
  }

  getIcon(){
    return this.validate() ? 'fa-check' : 'fa-close';
  }

}
