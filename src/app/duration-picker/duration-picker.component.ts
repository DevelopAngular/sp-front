import { Component, EventEmitter, OnInit, Output , Input} from '@angular/core';
import { Duration } from '../NewModels';

@Component({
  selector: 'app-duration-picker',
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.css']
})

export class DurationPickerComponent implements OnInit {

  @Input()
  minDuration:number = 3;
   
  @Input()
  maxDuration:number;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  public selectedDuration: number = 5;

  constructor() {}

  ngOnInit() {
    this.selectedDuration = 5;
    this.onChange.emit(this.selectedDuration);
  }

  updateDuration(event:any) {
    this.selectedDuration = event.value;
    this.onChange.emit(event.value);
  }

}
