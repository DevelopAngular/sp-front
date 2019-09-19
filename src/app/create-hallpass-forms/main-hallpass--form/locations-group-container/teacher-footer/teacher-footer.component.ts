import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-teacher-footer',
  templateUrl: './teacher-footer.component.html',
  styleUrls: ['./teacher-footer.component.scss']
})
export class TeacherFooterComponent implements OnInit {

  @Input() date;

  @Input() studentText;

  @Input() currentState: string;

  @Input() fromLocation;

  @Input() toLocation;

  @Input() state: string;

  @Input() formState: Navigation;

  @Output() changeLocation: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  showFullFooter: boolean = false;
  frameMotion$: BehaviorSubject<any>;
  constructor(
    private formService: CreateFormService
  ) { }

  get fromLocationText() {
    return this.fromLocation ? this.fromLocation.title : 'Origin';
  }

  get toLocationText() {
    return this.toLocation ? this.toLocation.title : 'Destination';
  }

  get fromCursor() {
     return this.state !== 'from' && !this.date && !this.formState.kioskMode;
  }

  get toCursor() {
    return this.state !== 'to' && this.state !== 'from';
  }

  get studentsCursor() {
    return !this.formState.kioskMode;
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  goToFromWhere(evt: Event) {
    evt.stopPropagation();
    this.formService.scalableBoxController.next(false);
     if (this.state === 'from' || this.date || this.formState.kioskMode) {
        return false;
     }
      this.formState.previousState = this.formState.state;
      this.formState.fromState = this.formState.state;
      this.formState.state = 1;
      this.changeLocation.emit(this.formState);
  }

  goToToWhere(evt: Event) {
    evt.stopPropagation();
    this.formService.scalableBoxController.next(false);
    if (this.state === 'to' || this.state === 'from' || this.formState.kioskMode) {
       return false;
     }
     this.formState.previousState = this.formState.state;
     this.formState.state = 2;
     this.changeLocation.emit(this.formState);
  }

  goToStudents(evt: Event) {
    evt.stopPropagation();
    this.formService.scalableBoxController.next(false);
    if (this.formState.kioskMode) {
      return false;
    }
    this.formState.previousState = this.formState.state;
    this.formState.step = 2;
    this.formState.previousStep = 3;
    this.formState.quickNavigator = true;
    this.changeLocation.emit(this.formState);
  }

  goToDate() {
    this.formService.scalableBoxController.next(false);
    this.formState.previousState = this.formState.state;
    this.formState.step = 1;
    this.formState.state = 1;
    this.formState.previousStep = 3;
    this.formState.quickNavigator = true;
    this.changeLocation.emit(this.formState);
  }
  setShowFooter(evt: Event) {
    this.showFullFooter = !this.showFullFooter;
    evt.stopPropagation();
  }
}
