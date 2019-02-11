import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Navigation } from '../../main-hall-pass-form.component';
import { Pinnable } from '../../../../models/Pinnable';
import {CreateFormService} from '../../../create-form.service';
import {BodyShowingUp, HeaderShowingUp} from '../../../../animations';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-to-category',
  templateUrl: './to-category.component.html',
  styleUrls: ['./to-category.component.scss'],
  animations: [HeaderShowingUp, BodyShowingUp]
})
export class ToCategoryComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() isStaff: boolean;

  @Input() date;

  @Input() studentText;

  @Input() fromLocation;

  @Output() locFromCategory: EventEmitter<any> = new EventEmitter<any>();

  @Output() backButton: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  pinnable: Pinnable;

  animatedComponetVisibility: boolean = true;

  isDisabled: boolean = false;

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private formService: CreateFormService
  ) { }

  get headerGradient() {
     const colors = this.formState.data.direction.pinnable.gradient_color;
     return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    if (this.formState.previousState > this.formState.state) {
      this.isDisabled = true;
    }


    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.fromLocation = this.formState.data.direction.from;
    this.pinnable = this.formState.data.direction.pinnable;
  }

  locationChosen(location) {
    this.isDisabled = true;
    this.formService.setFrameMotionDirection('forward');
    // this.animatedComponetVisibility = false;
    setTimeout(() => {
      // this.formState.previousState = this.formState.state;
      this.locFromCategory.emit(location);
    }, 550);

  }

  back() {
    this.formService.setFrameMotionDirection('back');
    this.animatedComponetVisibility = false;
    this.isDisabled = false;

    setTimeout(() => {
      this.formState.previousState = this.formState.state;
      this.formState.state -= 1;
      this.backButton.emit(this.formState);
    }, 550);
  }

}
