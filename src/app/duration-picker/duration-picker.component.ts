import { Component, EventEmitter, OnInit, Output , Input} from '@angular/core';
import { Duration } from '../NewModels';

@Component({
  selector: 'app-duration-picker',
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.css']
})

export class DurationPickerComponent implements OnInit {

  @Input()
  minDuration:number;
   
  @Input()
  maxDuration:number;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  public selectedDuration: number;

  constructor() {}

  ngOnInit() {
    this.selectedDuration = 5;
    this.onChange.emit(this.selectedDuration*60);
  }

  updateDuration() {
    this.onChange.emit(this.selectedDuration*60);
    console.log('[Duration Update]: ', this.selectedDuration);
  }

}
