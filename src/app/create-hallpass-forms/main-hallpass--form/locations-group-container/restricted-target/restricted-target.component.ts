import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';
import {States} from '../locations-group-container.component';

@Component({
  selector: 'app-restricted-target',
  templateUrl: './restricted-target.component.html',
  styleUrls: ['./restricted-target.component.scss'],

})
export class RestrictedTargetComponent implements OnInit {

  @Input() pinnable: Pinnable;

  @Input() formState: Navigation;

  @Input() date;

  toLocation;

  fromLocation;

  shadow: boolean = true;

  frameMotion$: BehaviorSubject<any>;

  @Output() requestTarget: EventEmitter<any> = new EventEmitter<any>();

  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  headerTransition = {
    'rest-tar-header': true,
    'rest-tar-header_animation-back': false
  }

  @HostListener('scroll', ['$event'])
    tableScroll(event) {
        const tracker = event.target;
        const limit = tracker.scrollHeight - tracker.clientHeight;
        if (event.target.scrollTop < limit) {
            this.shadow = true;
        }
        if (event.target.scrollTop === limit) {
            this.shadow = false;
        }
    }



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

    setTimeout(() => {

      const restricted = ((this.toLocation.restricted && !this.date) || (this.toLocation.scheduling_restricted && !!this.date));
      this.formState.previousState = this.formState.state;
      if (restricted && this.pinnable.location) {
        this.formState.state = 2;
      } else {
        this.formState.state -= 1;
      }
      this.backButton.emit(this.formState);
    }, 100);

  }

  updateTarget(target) {

    this.formService.setFrameMotionDirection('forward');
    this.formState.previousState = States.restrictedTarget;

    setTimeout(() => {
      this.requestTarget.emit(target);
    }, 100);

  }

  onChangeAnimationDirection(evt) {
    this.headerTransition['rest-tar-header'] = false;
    this.headerTransition['rest-tar-header_animation-back'] = true;
  }

}
