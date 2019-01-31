import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { Pinnable } from '../../../models/Pinnable';
import { Navigation } from '../../hallpass-form.component';

@Component({
  selector: 'app-restricted-target',
  templateUrl: './restricted-target.component.html',
  styleUrls: ['./restricted-target.component.scss']
})
export class RestrictedTargetComponent implements OnInit {

  @Input() pinnable: Pinnable;

  @Input() formState: Navigation;

  @Input() date;

  toLocation;

  fromLocation;

  @Output() requestTarget: EventEmitter<any> = new EventEmitter<any>();

  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  get headerGradient() {
    const colors = this.formState.data.direction.pinnable.gradient_color;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
      this.fromLocation = this.formState.data.direction.from;
      this.toLocation = this.formState.data.direction.to;
  }

  back() {
   const restricted = ((this.toLocation.restricted && !this.date) || (this.toLocation.scheduling_restricted && !!this.date));
    if (restricted && this.pinnable.location) {
      this.formState.state = 2;
    } else {
      this.formState.state -= 1;
    }
    this.formState.previousState = this.formState.state;
    this.backButton.emit(this.formState);
  }

  updateTarget(target) {
    this.requestTarget.emit(target);
  }

}
