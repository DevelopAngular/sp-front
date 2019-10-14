import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TimeService } from '../../../../services/time.service';
import { Navigation } from '../../main-hall-pass-form.component';
import { CreateFormService } from '../../../create-form.service';
import { ColorProfile } from '../../../../models/ColorProfile';
import * as moment from 'moment';
import {DeviceDetection} from '../../../../device-detection.helper';
import {BehaviorSubject, Subject} from 'rxjs';
import {StorageService} from '../../../../services/storage.service';
import {ScreenService} from '../../../../services/screen.service';
import {KeyboardShortcutsService} from '../../../../services/keyboard-shortcuts.service';
import {pluck, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent implements OnInit, OnDestroy {

  @Input() mock = null;
  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Output() result: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  startTime: moment.Moment = moment(this.timeService.nowDate());
  requestTime: moment.Moment = moment(this.timeService.nowDate()).add(5, 'minutes');

  form: FormGroup = new FormGroup({
    declinable: new FormControl(
      this.storage.getItem('declinable') ? JSON.parse(this.storage.getItem('declinable')) : true
    )
  });
  declinable: FormControl = new FormControl(true);

  colorProfile: ColorProfile;

  frameMotion$: BehaviorSubject<any>;

  headerTransition = {
    'from-header': true,
    'from-header_animation-back': false
  };

  destroy$: Subject<any> = new Subject<any>();


  constructor(
    public screenService: ScreenService,
    private timeService: TimeService,
    private formService: CreateFormService,
    private storage: StorageService,
    private shortcutsService: KeyboardShortcutsService
  ) {
  }

  get gradient() {
    if (this.colorProfile) {
        return `radial-gradient(circle at 98% 97%, ${this.colorProfile.gradient_color})`;
    } else {
      return '#00B476';
    }
  }

  get selectedColor() {
    return this.colorProfile ? this.colorProfile.solid_color : '#00B476';
  }

  ngOnInit() {
    if (this.mock) {
      this.requestTime = moment(this.timeService.nowDate());
      // this.declinable = new FormControl(true);
    } else {
      if (this.formState.data.date) {
        if (this.formState.data.request) {
          this.colorProfile = this.formState.data.request.color_profile;
        }
        this.requestTime = moment(this.formState.data.date.date);
        this.declinable.setValue(this.formState.data.date.declinable);
      }
      this.frameMotion$ = this.formService.getFrameMotionDirection();

    }
    this.frameMotion$.subscribe((v: any) => {
      switch (v.direction) {
        case 'back':
          this.headerTransition['from-header'] = false;
          this.headerTransition['from-header_animation-back'] = true;
          break;
        case 'forward':
          this.headerTransition['from-header'] = true;
          this.headerTransition['from-header_animation-back'] = false;
          break;
        default:
          this.headerTransition['from-header'] = true;
          this.headerTransition['from-header_animation-back'] = false;
      }
    });
    this.form.get('declinable').valueChanges
      .subscribe(value => this.storage.setItem('declinable', value));

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        pluck('key'),
        takeUntil(this.destroy$)
      ).subscribe(key => {
        if (key[0] === 'enter') {
          this.next();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calendarResult(date: moment.Moment[]) {
    this.requestTime = moment(date[0]);
  }

  next() {
    this.formService.compressableBoxController.next(false);
    this.formService.setFrameMotionDirection('forward');
    this.formState.data.date = {
      date: this.requestTime.toDate(),
      declinable: this.form.get('declinable').value
    };
    setTimeout(() => {
      this.result.emit(this.formState);
      if (!this.storage.getItem('declinable') && this.isStaff) {
        this.storage.setItem('declinable', this.form.get('declinable').value);
      }
    }, 100);
  }

  back() {
    if (!this.screenService.isDeviceLargeExtra && this.formState.formMode.role === 1) {
      this.formService.compressableBoxController.next(true);
      this.formService.setFrameMotionDirection('disable');
    } else {
      this.formService.compressableBoxController.next(false);
      this.formService.setFrameMotionDirection('back');
    }
    setTimeout(() => {
      if (this.isStaff) {
        this.formState.state = 1;
        this.formState.step = 2;
      } else {
        this.formState.step = 0;
      }
      // console.log('AaA ===>>>', event);
      this.backButton.emit(this.formState);
    }, 100);
  }

  get isPortableDevice() {
    return DeviceDetection.isIOSTablet() || DeviceDetection.isIOSMobile() || DeviceDetection.isAndroid();
  }
}
