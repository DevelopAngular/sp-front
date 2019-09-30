import {Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';

import { Navigation } from '../../main-hall-pass-form.component';
import { Pinnable } from '../../../../models/Pinnable';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material';
import {DeviceDetection} from '../../../../device-detection.helper';

@Component({
  selector: 'app-to-category',
  templateUrl: './to-category.component.html',
  styleUrls: ['./to-category.component.scss'],
})
export class ToCategoryComponent implements OnInit {
  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('rc') set rc(rc: ElementRef<HTMLDivElement> ) {
    if (rc) {
      fromEvent( rc.nativeElement, 'scroll').subscribe((evt: Event) => {
        let blur: number;

        if ((evt.target as HTMLDivElement).scrollTop < 100) {
          blur = 5;
        } else if ((evt.target as HTMLDivElement).scrollTop > 100 && (evt.target as HTMLDivElement).scrollTop < 400) {
          blur = (evt.target as HTMLDivElement).scrollTop / 20;
        } else {
          blur = 20;
        }

        this.header.nativeElement.style.boxShadow = `0 1px ${blur}px 0px rgba(0,0,0,.2)`;
      });
    }
  }
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
    'category-header': true,
    'category-header_animation-back': false
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
    this.frameMotion$.subscribe((v: any) => {
      switch (v.direction) {
        case 'back':
          this.headerTransition['category-header'] = false;
          this.headerTransition['category-header_animation-back'] = true;
          break;
        case 'forward':
          this.headerTransition['category-header'] = true;
          this.headerTransition['category-header_animation-back'] = false;
          break;
        default:
          this.headerTransition['category-header'] = true;
          this.headerTransition['category-header_animation-back'] = false;
      }
    });
  }

  locationChosen(location) {
    // this.formService.setFrameMotionDirection('forward');
    if (this.formState.formMode.role === 1) {
      this.formService.setFrameMotionDirection('disable');
    } else {
      this.formService.setFrameMotionDirection('forward');
    }

    setTimeout(() => {
      this.locFromCategory.emit(location);
    }, 100);

  }

  back() {

    this.formService.setFrameMotionDirection('back');

    setTimeout(() => {
      this.formState.previousState = this.formState.state;
      this.formState.state -= 1;
      this.backButton.emit(this.formState);
    }, 100);
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

}
