import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';

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
      if (this.formState.forLater) {
          this.formState.previousState = 1;
          this.formState.step = 1;
          this.formState.state = 1;
          this.formState.previousStep = 3;
          this.formState.quickNavigator = true;
      } else if (!!this.studentText && this.formState.state === 1) {
          this.formState.previousState = 1;
          this.formState.step = 2;
          this.formState.state = 1;
          this.formState.previousStep = 3;
          this.formState.quickNavigator = true;
      } else {
        this.formState.step = 0;
      }
      this.backButton.emit(this.formState);
  }

}
