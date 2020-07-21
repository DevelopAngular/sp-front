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

  @Input() disabled;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  @HostListener('window:wheel', ['$event'])
    onWheel(e) {
      const delta = e.deltaY || e.detail;
      if (delta < 0 && this.selectedDuration < this.maxDuration) {
        this.selectedDuration += 1;
      } else if (delta > 0 && this.selectedDuration > this.minDuration) {
        this.selectedDuration -= 1;
      }
      this.emitResult(this.selectedDuration);
    }

  public selectedDuration: number = 5;

  constructor() {}

  ngOnInit() {
    if (this.maxDuration === this.maxDuration) {
      this.minDuration = 0;
      this.disabled = true;
    }

    this.selectedDuration = this.maxDuration < 5 ? this.maxDuration : 5;

    this.emitResult(this.selectedDuration);
  }

  emitResult(value) {
    if (value && value <= this.maxDuration && value >= this.minDuration) {
      this.selectedDuration = value;
      // console.log('Value ==>>>', this.selectedDuration);
      this.onChange.emit(this.selectedDuration);
    } else {
      if (!value) {
        this.selectedDuration = 1;
        this.minDuration = 1;
      } else if (value > this.maxDuration) {
        this.selectedDuration = this.maxDuration;
      }
    }
  }

  updateDuration(event:any) {
    if (!event.value) {
      this.minDuration = 1;
    } else {
        this.emitResult(event.value);
    }
  }

}
