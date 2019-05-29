import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';

import { Navigation } from '../../main-hall-pass-form.component';
import { Pinnable } from '../../../../models/Pinnable';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-to-category',
  templateUrl: './to-category.component.html',
  styleUrls: ['./to-category.component.scss'],
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
  animationDirection: string = 'forward';

  frameMotion$: BehaviorSubject<any>;

  headerTransition = {
    'category-header': false,
    'category-header_animation-back': true
  };

  shadow: boolean = true;

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
    @Inject(MAT_DIALOG_DATA) public dialogData: any,

  ) { }

  get headerGradient() {
     const colors =  this.animationDirection === 'back' ? '#FFFFFF, #FFFFFF' :  this.formState.data.direction.pinnable.color_profile.gradient_color;
     return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {

    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.fromLocation = this.formState.data.direction.from;
    this.pinnable = this.formState.data.direction.pinnable;
  }

  locationChosen(location) {
    this.formService.setFrameMotionDirection('forward');
    this.headerTransition['category-header'] = true;
    this.headerTransition['category-header_animation-back'] = false;
    setTimeout(() => {
      this.locFromCategory.emit(location);
    }, 100);

  }

  back() {

    this.formService.setFrameMotionDirection('back');
    this.headerTransition['category-header'] = false;
    this.headerTransition['category-header_animation-back'] = true;

    // console.log('BACK BACK BACK ____>');

    setTimeout(() => {
      this.formState.previousState = this.formState.state;
      this.formState.state -= 1;
      this.backButton.emit(this.formState);
    }, 100);
  }

}
