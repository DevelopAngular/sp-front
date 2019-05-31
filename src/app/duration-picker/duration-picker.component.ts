import {Component, EventEmitter, OnInit, Output, Input, HostListener} from '@angular/core';

@Component({
  selector: 'app-duration-picker',
  templateUrl: './duration-picker.component.html',
  styleUrls: ['./duration-picker.component.scss']
})

export class DurationPickerComponent implements OnInit {

  @Input()
  minDuration: number = 1;

  @Input()
  maxDuration: number = 5;

  @Input()
  forStaff: boolean;

  @Input()
  plural: boolean;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  @HostListener('window:wheel', ['$event'])
    onWheel(e) {
      const delta = e.deltaY || e.detail;
      if (delta < 0 && this.selectedDuration < this.maxDuration) {
        this.selectedDuration += 1;
      } else if (delta > 0 && this.selectedDuration > this.minDuration) {
        this.selectedDuration -= 1;
      }
      this.onChange.emit(this.selectedDuration);
    }

  public selectedDuration: number = 5;

  constructor() {}

  ngOnInit() {
    this.selectedDuration = this.maxDuration < 5 ? this.maxDuration : 5;
    this.onChange.emit(this.selectedDuration);
  }

  updateDuration(event:any) {
    this.selectedDuration = event.value;
    this.onChange.emit(event.value);
  }

}
