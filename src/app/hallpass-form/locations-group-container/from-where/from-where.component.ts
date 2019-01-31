import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LocationService} from '../location.service';
import {Navigation} from '../../hallpass-form.component';

@Component({
  selector: 'app-from-where',
  templateUrl: './from-where.component.html',
  styleUrls: ['./from-where.component.scss']
})
export class FromWhereComponent implements OnInit {

  @Input() date;

  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Input() studentText;

  @Output() selectedLocation: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  locationChosen(location) {
    this.selectedLocation.emit(location);
  }

  back() {
      if (!!this.date) {
          this.formState.previousState = 1;
          this.formState.step = 1;
          this.formState.state = 1;
          this.formState.previousStep = 3;
      } else if (!!this.studentText && this.formState.state === 1) {
          this.formState.previousState = 1;
          this.formState.step = 2;
          this.formState.state = 1;
          this.formState.previousStep = 3;
      } else {
        this.formState.step = 0;
      }
      this.backButton.emit(this.formState);
  }

}
