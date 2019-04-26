import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Navigation } from '../../main-hall-pass-form.component';
import { Location } from '../../../../models/Location';
import { User } from '../../../../models/User';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-restricted-message',
  templateUrl: './restricted-message.component.html',
  styleUrls: ['./restricted-message.component.scss'],
})
export class RestrictedMessageComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() gradient: string;

  @Input() teacher: User;

  @Input() date: string | boolean;

  @Output() resultMessage: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  messageBox;
  @ViewChild('messageBox') set content(content: ElementRef) {
    this.messageBox = content;
    // this.messageBox.nativeElement.focus();
  }

  fromLocation: Location;

  toLocation: Location;

  message: FormControl;

  frameMotion$: BehaviorSubject<any>;

  headerTransition = {
    'rest-mes-header': true,
    'rest-mes-header_animation-back': false
  };

  constructor(
    private formService: CreateFormService
  ) { }

  get headerGradient() {
    const colors = this.gradient;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
      if (this.formState.previousState > this.formState.state || this.formState.previousStep > this.formState.step) {
      this.headerTransition['rest-mes-header'] = false;
      this.headerTransition['rest-mes-header_animation-back'] = true;
    }

    this.frameMotion$ = this.formService.getFrameMotionDirection();
    // setTimeout(() => {
    //     this.messageBox.nativeElement.focus();
    // }, 50);
    this.message = new FormControl(this.formState.data.message);
    this.fromLocation = this.formState.data.direction.from;
    this.toLocation = this.formState.data.direction.to;
    this.teacher = this.formState.data.requestTarget;
  }

  back() {

    this.formService.setFrameMotionDirection('back');
    this.headerTransition['rest-mes-header'] = true;
    this.headerTransition['rest-mes-header_animation-back'] = false;

    setTimeout(() => {

      if (!this.formState.forInput) {
        if (this.formState.missedRequest) {
          this.formState.state = 1;
        } else {
            this.formState.step = 0;
        }
      } else {
        this.formState.previousState = this.formState.state;
        this.formState.state -= 1;
      }
      this.backButton.emit(this.formState);
    }, 100);



  }

  sendRequest() {
    this.formService.setFrameMotionDirection('forward');
    // this.headerTransition['rest-mes-header'] = false;
    // this.headerTransition['rest-mes-header_animation-back'] = true;
    setTimeout(() => {
      this.resultMessage.emit(this.message.value);
      // this.formService.setFrameMotionDirection('back');
    }, 100);
  }

  onChangeAnimationDirection(evt) {
    console.log(evt);
    this.headerTransition['rest-mes-header'] = false;
    this.headerTransition['rest-mes-header_animation-back'] = true;
  }

}
