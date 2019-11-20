import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Navigation } from '../../main-hall-pass-form.component';
import { Location } from '../../../../models/Location';
import { CreateFormService } from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';
import {StorageService} from '../../../../services/storage.service';

@Component({
  selector: 'app-student-footer',
  templateUrl: './student-footer.component.html',
  styleUrls: ['./student-footer.component.scss']
})
export class StudentFooterComponent implements OnInit {

  @Input() formState: Navigation;

  @Input() date;

  @Input() state;

  @Output() changeAnimationDirectionEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeLocation: EventEmitter<Navigation> = new EventEmitter<Navigation>();
  @Output() locsViewEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  fromLocation: Location;
  toLocation: Location;
  forInput: boolean;
  frameMotion$: BehaviorSubject<any>;

  isGrid: boolean;;

  constructor(
    private formService: CreateFormService,
    private storage: StorageService,
  ) { }

  get fromLocationText() {
    return this.fromLocation ? this.fromLocation.title : 'Origin';
  }

  get toLocationText() {
    return this.toLocation && (this.state !== 'to' && this.state !== 'category') ? this.toLocation.title : 'Destination';
  }

  get fromCursor() {
    return this.state !== 'from' && this.forInput;
  }

  get toCursor() {
    return this.state !== 'to' && this.state !== 'from' && this.forInput;
  }

  ngOnInit() {
    this.isGrid = JSON.parse(this.storage.getItem('isGrid'));
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    if (this.formState) {
      this.forInput = this.formState.forInput;
      this.fromLocation = this.formState.data.direction.from;
      this.toLocation = this.formState.data.direction.to;
    }
  }

  switchLocsView(evt: Event) {
    this.isGrid = !this.isGrid;
    this.locsViewEvent.emit(!this.isGrid);
    evt.stopPropagation();
  }

  goToFromWhere() {
    this.changeAnimationDirection();
    setTimeout(() => {
      if (this.state === 'from' || !this.forInput) {
        return false;
      }
      this.formState.previousState = this.formState.state;
      this.formState.fromState = this.formState.state;
      this.formState.state = 1;
      this.changeLocation.emit(this.formState);
    }, 100);
  }

  goToToWhere() {
    this.changeAnimationDirection();
    setTimeout(() => {
      if (this.state === 'to' || this.state === 'from' || !this.forInput) {
        return false;
      }
      this.formState.previousState = this.formState.state;
      this.formState.state = 2;
      this.changeLocation.emit(this.formState);
    }, 100);
  }

  goToDate() {
    this.changeAnimationDirection();
    setTimeout(() => {
      this.formState.previousState = this.formState.state;
      this.formState.step = 1;
      this.formState.state = 1;
      this.formState.previousStep = 3;
      this.formState.quickNavigator = true;
      this.changeLocation.emit(this.formState);
    }, 100);
  }

  private changeAnimationDirection() {
    this.formService.scalableBoxController.next(false);
    this.formService.setFrameMotionDirection('back');
    this.changeAnimationDirectionEvent.emit(true);
  }
}
