import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {

  @Input() showTime: boolean = true;
  @Input() min: Date = new Date();
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  timeS = '--:--';

  @Input() _selectedMoment: Date = new Date();

  constructor() {
  }

  set selectedMoment(newMoment: Date){
    this._selectedMoment = newMoment;
    this.onUpdate.emit(this._selectedMoment);
    console.log('[Date-Time Moment]: ', this._selectedMoment);
  }

  get selectedMoment(){
    return this._selectedMoment;
  }

  ngOnInit() {
    console.log('[Date-Time Debug]: ', 'Date-Time where at');
    this._selectedMoment.setMinutes(this._selectedMoment.getMinutes()+1)
    this.min.setMinutes(this.min.getMinutes()+1)
    this.onUpdate.emit(this._selectedMoment);
  }
}
