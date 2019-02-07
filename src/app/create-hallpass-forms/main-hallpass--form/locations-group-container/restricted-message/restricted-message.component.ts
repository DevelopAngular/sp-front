import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Navigation } from '../../main-hall-pass-form.component';
import { Location } from '../../../../models/Location';
import { User } from '../../../../models/User';
import {CreateFormService} from '../../../create-form.service';
import {BodyShowingUp, HeaderShowingUp} from '../../../../animations';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-restricted-message',
  templateUrl: './restricted-message.component.html',
  styleUrls: ['./restricted-message.component.scss'],
  animations: [HeaderShowingUp, BodyShowingUp]

})
export class RestrictedMessageComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() gradient: string;

  @Input() teacher: User;

  @Input() date: string | boolean;

  @Output() resultMessage: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  fromLocation: Location;

  toLocation: Location;

  message: FormControl;
  animatedComponetVivibility: boolean = true;
  frameMotion$: BehaviorSubject<any>;
  constructor(
    private formService: CreateFormService
  ) { }

  get headerGradient() {
    // const colors = this.formState.data.direction.pinnable.gradient_color;
    const colors = this.gradient;
    return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.message = new FormControl(this.formState.data.message);
    this.fromLocation = this.formState.data.direction.from;
    this.toLocation = this.formState.data.direction.to;
    this.teacher = this.formState.data.requestTarget;
  }

  back() {


    this.formService.setFrameMotionDirection('back');
    this.animatedComponetVivibility = false;

    setTimeout(() => {

      if (!this.formState.forInput) {
        this.formState.step = 0;
      } else {
        this.formState.previousState = this.formState.state;
        this.formState.state -= 1;
      }
      this.backButton.emit(this.formState);
    }, 250);



  }

  sendRequest() {
    this.formService.setFrameMotionDirection('forward');
    this.animatedComponetVivibility = false;

    setTimeout(() => {
      this.resultMessage.emit(this.message.value);
    }, 250);

  }

}
