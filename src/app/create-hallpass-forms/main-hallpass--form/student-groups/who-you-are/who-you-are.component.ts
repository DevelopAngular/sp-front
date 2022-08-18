import {ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output} from '@angular/core';
import {CreateFormService} from '../../../create-form.service';
import {MatDialogRef} from '@angular/material/dialog';
import {MainHallPassFormComponent, Navigation} from '../../main-hall-pass-form.component';
import {ScreenService} from '../../../../services/screen.service';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {PassLimitService} from '../../../../services/pass-limit.service';
import {User} from '../../../../models/User';

@Component({
  selector: 'app-who-you-are',
  templateUrl: './who-you-are.component.html',
  styleUrls: ['./who-you-are.component.scss']
})
export class WhoYouAreComponent implements OnInit {

  @Input() formState: Navigation;
  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter();

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private dialogRef: MatDialogRef<WhoYouAreComponent>,
    private formService: CreateFormService,
    private screenService: ScreenService,
    private passLimitsService: PassLimitService,
    private _injector: Injector,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  setSelectedStudents(evt) {
    this.formService.setFrameMotionDirection('forward');
    this.formService.compressableBoxController.next(false);

    if (this.formState.forLater) {
      setTimeout(() => {
        this.formState.step = 1;
        this.formState.fromState = 1;
        this.formState.data.selectedStudents = evt;
        this.stateChangeEvent.emit(this.formState);
      }, 100);
      return;
    }

    const mainParent = this._injector.get<MainHallPassFormComponent>(MainHallPassFormComponent);
    forkJoin({
      studentPassLimit: this.passLimitsService.getStudentPassLimit((evt[0] as User).id),
      remainingLimit: this.passLimitsService.getRemainingLimits({ studentId: (evt[0] as User).id })
    }).subscribe({
      next: ({ studentPassLimit, remainingLimit }) => {
        const passLimitInfo = {
          max: studentPassLimit.passLimit,
          showPasses: !studentPassLimit.noLimitsSet && !studentPassLimit.isUnlimited && studentPassLimit.passLimit !== null,
          current: remainingLimit.remainingPasses
        };
        mainParent.dialogData.passLimitInfo = passLimitInfo;
        mainParent.FORM_STATE = {
          ...mainParent.FORM_STATE,
          passLimitInfo,
          state: 2,
          step: 3,
          fromState: 4,
          data: {
            ...mainParent.FORM_STATE.data,
            selectedStudents: evt,
            kioskModeStudent: evt[0]
          }
        };
        this.stateChangeEvent.emit(mainParent.FORM_STATE);
        this.cdr.detectChanges();
      }
    });
  }
  back() {
    this.dialogRef.close();
  }
}
