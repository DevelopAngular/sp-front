import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-from-where',
  templateUrl: './from-where.component.html',
  styleUrls: ['./from-where.component.scss']
})
export class FromWhereComponent implements OnInit {

  @Input() date;

  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Input() studentText;

  @Output() selectedLocation: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  shadow: boolean;
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

  ngOnInit() {
  }

  locationChosen(location) {

    this.formService.setFrameMotionDirection('forward');

    setTimeout(() => {
      this.formState.previousState = 1;
      this.selectedLocation.emit(location);
    }, 100);


  }


  back() {

    this.formService.setFrameMotionDirection('back');


    setTimeout(() => {
      if (this.formState.forLater) {
        this.formState.previousState = 1;
        this.formState.previousStep = 3;
        this.formState.step = 1;
        this.formState.state = 1;
        this.formState.previousStep = 3;
        // this.formState.quickNavigator = true;
      } else if (!!this.studentText && this.formState.state === 1) {
        this.formState.previousState = 1;
        this.formState.step = 2;
        this.formState.state = 1;
        this.formState.previousStep = 3;
        // this.formState.quickNavigator = true;
      } else {
        this.formState.step = 0;
      }
      this.backButton.emit(this.formState);
    }, 100);
  }
}
