import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { HttpService } from '../../../../http-service';
import { LocationService } from '../location.service';
import {Navigation} from '../../main-hall-pass-form.component';

@Component({
  selector: 'app-to-where',
  templateUrl: './to-where.component.html',
  styleUrls: ['./to-where.component.scss']
})
export class ToWhereComponent implements OnInit {

  @Input() location;

  @Input() formState: Navigation;

  @Input() pinnables: Promise<Pinnable[]>;

  @Input() isStaff: boolean;

  @Input() date;

  @Input() studentText;

  @Output() selectedPinnable: EventEmitter<any> = new EventEmitter<any>();

  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.location = this.formState.data.direction ? this.formState.data.direction.from : null;
  }

  pinnableSelected(pinnable) {
    this.selectedPinnable.emit(pinnable);
  }

  back() {
    if (!!this.date &&
        !!this.studentText &&
        (this.formState.previousStep === 2 || this.formState.previousStep === 4)
    ) {
        this.formState.previousState = this.formState.state;
        this.formState.step = 2;
        this.formState.state = 1;
        this.formState.previousStep = 3;
    } else {
      this.formState.previousState = this.formState.state;
      if (this.formState.formMode.formFactor === 3) {
        this.formState.step = 2;
      } else {
        this.formState.state -= 1;
      }
    }
    //
    this.backButton.emit(this.formState);
  }

}
