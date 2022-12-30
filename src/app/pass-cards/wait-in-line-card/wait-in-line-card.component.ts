import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit, Optional,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core'
import { Navigation } from '../../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component'
import { User } from '../../models/User'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { School } from '../../models/School'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { HallPassesService } from '../../services/hall-passes.service'
import { LoadingService } from '../../services/loading.service'
import { CreateFormService } from '../../create-hallpass-forms/create-form.service'
import { TimeService } from '../../services/time.service'
import { ScreenService } from '../../services/screen.service'
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service'
import { DomCheckerService } from '../../services/dom-checker.service'
import { UserService } from '../../services/user.service'
import { ToastService } from '../../services/toast.service'
import { EncounterPreventionService } from '../../services/encounter-prevention.service'
import { PassLimitService } from '../../services/pass-limit.service'
import { LocationsService } from '../../services/locations.service'
import { DeviceDetection } from '../../device-detection.helper'
import { scalePassCards } from '../../animations'
import { WaitInLine } from '../../models/WaitInLine'
import { WaitInLineService } from '../../services/wait-in-line.service'

/**
 * Wait in Line has 2 parts, similar to the pass request flow:
 * 1. Wait in Line Creation (queuing a student in line)
 * 2. Wait in Line Acceptance (starting the pass for a student at the front of the line)
 *
 * This component deals with the first step (queuing a student in line).
 * A student waits in line to a room when the active now limit has been reached.
 * This component collects all the basic information required to start a pass (origin,
 * destination, duration, student, color, etc). When the student reaches the front of
 * the line, this same info can be used to start the pass.
 *
 * // TODO: Cut out any unnecessary parts of this component
 * // TODO: Teacher's flow
 */
@Component({
  selector: 'app-wait-in-line-card',
  templateUrl: './wait-in-line-card.component.html',
  styleUrls: ['./wait-in-line-card.component.scss'],
  animations: [scalePassCards]
})
export class WaitInLineCardComponent implements OnInit {

  @Input() wil: WaitInLine;
  @Input() forStaff = false;
  @Input() forKioskMode = false;
  @Input() formState: Navigation;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('cardWrapper') cardWrapper: ElementRef;
  @ViewChild('confirmDialogBody') confirmDialog: TemplateRef<HTMLElement>;
  @ViewChild('confirmDialogBodyVisibility') confirmDialogVisibility: TemplateRef<HTMLElement>;

  valid = true;
  buttonWidth = 288;
  selectedDuration: number;
  selectedTravelType: string;
  timers: number[] = [];
  user: User;
  performingAction: boolean;
  isModal = false;
  showStudentInfoBlock: boolean = true;
  passForStudentsComponent: boolean;
  activePassTime$: Observable<string>;
  header: string;
  options: any = [];
  frameMotion$: BehaviorSubject<any>;
  currentSchool: School;
  isEnableProfilePictures$: Observable<boolean>;
  scaleCardTrigger$: Observable<string>;
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    @Optional() public dialogRef: MatDialogRef<WaitInLineCardComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private hallPassService: HallPassesService,
    public dialog: MatDialog,
    private loadingService: LoadingService,
    private formService: CreateFormService,
    private timeService: TimeService,
    public screenService: ScreenService,
    private shortcutsService: KeyboardShortcutsService,
    private domCheckerService: DomCheckerService,
    private userService: UserService,
    private toastService: ToastService,
    private encounterService: EncounterPreventionService,
    private passLimitService: PassLimitService,
    private locationsService: LocationsService,
    private wilService: WaitInLineService
  ) {
  }

  get gradient() {
    return 'radial-gradient(circle at 73% 71%, ' + this.wil.color_profile.gradient_color + ')';
  }

  get studentText() {
    // studentGroup is populated on when a teacher creates the pass
    // Wait-in-Line passes are not maod
    const studentGroup = this.formState.data.roomStudents ?? this.formState.data.selectedStudents;
    const student = studentGroup[0];

    return student
      ? student.display_name
      : this.wil.student.display_name + ` (${this.studentEmail})`;
  }

  get studentEmail() {
    return this.wil.student.primary_email.split('@', 1)[0];
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  ngOnInit(): void {
    const studentGroup = this.formState.data.roomStudents ?? this.formState.data.selectedStudents;
    this.wil.student = studentGroup[0];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  cancelEdit() {
    this.formState.step = 3;
    this.formState.previousStep = 4;
    this.formService.setFrameMotionDirection('disable');
    this.cardEvent.emit(this.formState);
  }

  /**
   * Trigger this function to queue this pass into a line waiting on a room
   * This does not count as actually creating a pass
   * The origin and destination will already be present in this.wil.
   *
   * 1. Set the performingAction to true
   * 2. Gather data from inputs to send to the backend
   * 3. Send data to backend
   * 4.
   */
  queuePassInLine() {
    // 1. Set the performingAction to true
    this.performingAction = true;
    // 2. Gather data from inputs to send to the backend
    const body = {
      'duration': this.selectedDuration * 60,
      'origin': this.wil.origin.id,
      'destination': this.wil.destination.id,
      'travel_type': this.selectedTravelType
    };

    this.wil.duration = this.selectedDuration * 60;
    this.wil.travel_type = this.selectedTravelType;

    // body['override_visibility'] = this.formState.data.roomOverride;

    // if (this.forFuture) {
    //   body['issuer_message'] = this.wil.issuer_message;
    //   body['start_time'] = this.wil.start_time.toISOString();
    // }
    if (this.forKioskMode) {
      body['self_issued'] = true;
      this.wil.self_issued = true
    }
    if (!this.forStaff) {
      delete body['override_visibility'];
      if (this.forKioskMode) {
        // that's it, the origin room should be considered room visibility free
        // to permits a student in kiosk mode to appear in who-are-you component
        // so the code below
        body['override_visibility_origin'] = true;
      }
      body['isNotBulk'] = true;
    }

    // 3. Send data to backend
    if (this.forStaff) {
      this.wilService.fakeWilPasses.next([...this.wilService.fakeWilPasses.getValue(), this.wil]);
    } else {
      this.wilService.fakeWil.next(this.wil);
      this.wilService.fakeWilPasses.next([...this.wilService.fakeWilPasses.getValue(), this.wil]);
    }

    this.wilService.fakeWilActive.next(true);
    this.performingAction = false;
    this.dialogRef.close();
  }

  genOption(display, color, action, icon?) {
    return {display: display, color: color, action: action, icon};
  }

}
