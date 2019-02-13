import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';

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

  constructor(
    private formService: CreateFormService
  ) { }

  ngOnInit() {
    this.location = this.formState.data.direction ? this.formState.data.direction.from : null;
  }

  pinnableSelected(pinnable) {

    function headerGradient(_pinnable) {
      const colors = _pinnable.gradient_color;
      return 'radial-gradient(circle at 98% 97%,' + colors + ')';
    }

    this.formService.setFrameMotionDirection('forward');
    this.formService.setFrameMotionDirection('setColoredTransition', headerGradient(pinnable));

    // this.formService.setFrameMotionDirection('forward');

    setTimeout(() => {
      this.selectedPinnable.emit(pinnable);

    }, 100);


  }

  back() {

    this.formService.setFrameMotionDirection('back');

    setTimeout(() => {
      if (!!this.date &&
        !!this.studentText &&
        (this.formState.previousStep === 2 || this.formState.previousStep === 4)
      ) {
        this.formState.previousState = this.formState.state;
        this.formState.step = 1;
        this.formState.previousStep = 3;
      } else {
        this.formState.previousState = this.formState.state;
        if (this.formState.formMode.formFactor === 3) {
          this.formState.step = 1;
        } else {
          this.formState.state -= 1;
        }
      }
      //
      this.backButton.emit(this.formState);
    }, 100);


  }

}
