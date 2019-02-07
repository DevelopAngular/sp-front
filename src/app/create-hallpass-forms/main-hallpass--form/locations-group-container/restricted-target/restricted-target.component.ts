import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BodyShowingUp, HeaderShowingUp} from '../../../../animations';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-restricted-target',
  templateUrl: './restricted-target.component.html',
  styleUrls: ['./restricted-target.component.scss'],
  animations: [HeaderShowingUp, BodyShowingUp]

})
export class RestrictedTargetComponent implements OnInit {

  @Input() pinnable: Pinnable;

  @Input() formState: Navigation;

  @Input() date;

  toLocation;

  fromLocation;

  @Output() requestTarget: EventEmitter<any> = new EventEmitter<any>();

  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  animatedComponetVivibility: boolean = true;
  frameMotion$: BehaviorSubject<any>;


  constructor(
    private formService: CreateFormService
  ) { }

  get headerGradient() {
    const colors = this.formState.data.direction.pinnable.gradient_color;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.fromLocation = this.formState.data.direction.from;
      this.toLocation = this.formState.data.direction.to;
  }

  back() {


    this.formService.setFrameMotionDirection('back');
    this.animatedComponetVivibility = false;

    setTimeout(() => {

      const restricted = ((this.toLocation.restricted && !this.date) || (this.toLocation.scheduling_restricted && !!this.date));
      if (restricted && this.pinnable.location) {
        this.formState.state = 2;
      } else {
        this.formState.state -= 1;
      }
      this.formState.previousState = this.formState.state;
      this.backButton.emit(this.formState);
    }, 250);

  }

  updateTarget(target) {

    this.formService.setFrameMotionDirection('forward');
    this.animatedComponetVivibility = false;

    setTimeout(() => {
      this.requestTarget.emit(target);
    }, 250);

  }

}
