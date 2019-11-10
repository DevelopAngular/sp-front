import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject} from 'rxjs';
import {ScreenService} from '../../../../services/screen.service';
import {StorageService} from '../../../../services/storage.service';

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
  @Output() locsViewEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  showFullFooter: boolean = false;
  frameMotion$: BehaviorSubject<any>;

  isGrid: boolean;

  constructor(
    private formService: CreateFormService,
    private screenService: ScreenService,
    private storage: StorageService
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
    this.isGrid = JSON.parse(this.storage.getItem('isGrid'));
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
    if (!this.screenService.isDeviceLargeExtra) {
      this.formService.setFrameMotionDirection('disable');
      this.formService.compressableBoxController.next(true);
    }
    this.formService.scalableBoxController.next(false);

    setTimeout(() => {
      if (this.formState.kioskMode) {
        return false;
      }
      this.formState.previousState = this.formState.state;
      this.formState.step = 2;
      this.formState.state = 1;
      this.formState.previousStep = 3;
      this.formState.previousState = 2;
      this.formState.quickNavigator = true;
      this.changeLocation.emit(this.formState);
    }, 100);

  }

  switchLocsView(evt: Event) {
    this.isGrid = !this.isGrid;
    evt.stopPropagation();
    this.locsViewEvent.emit(this.isGrid);
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
