import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Duration} from '../NewModels';

@Component({
  selector: 'app-duration-picker',
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.css']
})

export class DurationPickerComponent implements OnInit {
  durations: Duration[] = [
                          new Duration('5 minutes', 300),
                          new Duration('10 minutes', 600),
                          new Duration('15 minutes', 900),
                          new Duration('30 minutes', 1800)
                        ];
  public selectedDuration: Duration;
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.selectedDuration = new Duration('3 minutes', 180);
  }

  validate(){
    return this.selectedDuration instanceof Duration;
  }

  getIcon(){
    return this.validate() ? 'fa-check' : 'fa-close';
  }

  updateDuration(){
    this.onChange.emit(this.selectedDuration);
  }

}
