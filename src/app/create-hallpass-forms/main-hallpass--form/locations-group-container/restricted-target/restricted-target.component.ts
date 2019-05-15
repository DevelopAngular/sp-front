import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Pinnable } from '../../../../models/Pinnable';
import { Navigation } from '../../main-hall-pass-form.component';
import { CreateFormService } from '../../../create-form.service';
import { BehaviorSubject } from 'rxjs';
import { States } from '../locations-group-container.component';
import { DomSanitizer } from '@angular/platform-browser';

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
  };

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
    private formService: CreateFormService,
    public sanitizer: DomSanitizer

  ) {
  }

  get headerGradient() {
    const colors = this.formState.data.direction.pinnable.color_profile.gradient_color;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  get quickSelectedTeachers() {
    const to = this.formState.data.direction.to;
    if (!this.formState.forLater && to.request_mode === 'teacher_in_room') {
      if (to.request_send_destination_teachers && to.request_send_origin_teachers) {
        return [...to.teachers, ...this.formState.data.direction.from.teachers];
      } else if (to.request_send_destination_teachers) {
        return to.teachers;
      } else if (to.request_send_origin_teachers) {
        return this.formState.data.direction.from.teachers;
      }
    } else if (this.formState.forLater && to.scheduling_request_mode === 'teacher_in_room') {
        if (to.scheduling_request_send_destination_teachers && to.scheduling_request_send_origin_teachers) {
          return [...to.teachers, ...this.formState.data.direction.from.teachers];
        } else if (to.scheduling_request_send_destination_teachers) {
          return to.teachers;
        } else if (to.scheduling_request_send_origin_teachers) {
          return this.formState.data.direction.from.teachers;
        }
    } else {
      return to.teachers;
    }
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.fromLocation = this.formState.data.direction.from;
    this.toLocation = this.formState.data.direction.to;
  }

  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  getBackground(item) {
    if (item.hovered) {
      if (item.pressed) {
        return '#E2E7F4';
      } else {
        return '#ECF1FF';
      }
    } else {
      return '#FFFFFF';
    }
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
    console.log(target);
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
