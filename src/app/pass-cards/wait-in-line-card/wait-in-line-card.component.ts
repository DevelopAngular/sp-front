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
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs'
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
import { Util } from '../../../Util'
import { scalePassCards } from '../../animations'
import { WaitInLine } from '../../models/WaitInLine'
import { WaitInLineService } from '../../services/wait-in-line.service'

@Component({
  selector: 'app-wait-in-line-card',
  templateUrl: './wait-in-line-card.component.html',
  styleUrls: ['./wait-in-line-card.component.scss'],
  animations: [scalePassCards]
})
export class WaitInLineCardComponent implements OnInit {

  @Input() wil: WaitInLine;
  @Input() forInput = false;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() forMonitor = false;
  @Input() forKioskMode = false;
  @Input() formState: Navigation;
  @Input() students: User[] = [];
  @Input() isInline = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild('cardWrapper') cardWrapper: ElementRef;
  @ViewChild('confirmDialogBody') confirmDialog: TemplateRef<HTMLElement>;
  @ViewChild('confirmDialogBodyVisibility') confirmDialogVisibility: TemplateRef<HTMLElement>;

  timeLeft = '';
  valid = true;
  returnData: any = {};
  overlayWidth = '0px';
  buttonWidth = 288;

  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen = false;
  selectedStudents: User[] = [];
  fromHistory;
  fromHistoryIndex;

  pagerPages = 0;

  timers: number[] = [];

  p1Title;
  p1Subtitle;
  p1Stamp;
  p2Title;
  p2Subtitle;
  p2Stamp;
  p3Title;
  p3Subtitle;
  p3Stamp;
  p4Title;
  p4Subtitle;
  p4Stamp;

  user: User;
  activePage;

  performingAction: boolean;
  isModal = false;
  showStudentInfoBlock: boolean = true;
  passForStudentsComponent: boolean;
  hideButton: boolean;

  startEndPassLoading$: Observable<boolean>;

  isSeen: boolean;

  activePassTime$: Observable<string>;

  header: string;
  options: any = [];
  cancelEditClick: boolean;
  frameMotion$: BehaviorSubject<any>;
  currentSchool: School;

  isEnableProfilePictures$: Observable<boolean>;

  scaleCardTrigger$: Observable<string>;

  destroy$: Subject<any> = new Subject<any>();

  fakeDate = new Date();

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

  getUserName(user: any) {
    if (user instanceof User) {
      return user.isSameObject(this.user) ? 'Me' : user.first_name.substr(0, 1) + '. ' + user.last_name;
    } else {
      return user.first_name.substr(0, 1) + '. ' + user.last_name;
    }
  }

  get gradient() {
    return 'radial-gradient(circle at 73% 71%, ' + this.wil.color_profile.gradient_color + ')';
  }

  get studentText() {
    if (this.formState && this.formState.data.selectedGroup) {
      return this.formState.data.selectedGroup.title;
    } else {
      const selectedStudents = this.formState.data.roomStudents ?? this.selectedStudents;
      return (selectedStudents ?
        (selectedStudents.length > 2 ?
          selectedStudents[0].display_name + ' and ' + (selectedStudents.length - 1) + ' more' :
          selectedStudents[0].display_name + (selectedStudents.length > 1 ?
            ' and ' + selectedStudents[1].display_name : '')) :
        this.wil.student.display_name + ` (${this.studentEmail})`);
    }
  }

  get studentEmail() {
    return this.wil.student.primary_email.split('@', 1)[0];
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get closeIcon() {
    if (((this.isActive && this.forStaff) || this.forMonitor)) {
      return './assets/Dots (Transparent).svg';
    } else {
      return './assets/' + (this.forInput ? 'Chevron Left ' : 'Delete ') + '(Transparent).svg';
    }
  }

  get hasClose() {
    return ((this.forInput || this.forStaff || this.wil.cancellable_by_student || this.user.isStudent()) && !this.fromPast) && !this.hideButton;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  formatDateTime(date: Date) {
    date = new Date(date);
    return Util.formatDateTime(date);
  }

  getDuration() {
    // const start: Date = this.wil.start_time;
    // const end: Date = this.wil.end_time;
    // const timeDiff = Math.abs(start.getTime() - end.getTime());
    // const diffSecs = Math.ceil(timeDiff / 1000);
    // return Math.floor(diffSecs / 60) + ':' + (diffSecs % 60 < 10 ? '0' : '') + diffSecs % 60;

    return 10;
  }

  buildPages() {
    if (this.forFuture && this.wil.issuer) {
      this.buildPage('Pass Created', 'by ' +
        this.getUserName(this.wil.issuer), this.formatDateTime(this.wil.created), (this.pagerPages + 1));
    } else if (this.wil.issuer) {
      this.buildPage('Pass Created', 'by ' +
        this.getUserName(this.wil.issuer), this.formatDateTime(this.wil.created), (this.pagerPages + 1));
    }

    // if (this.wil.parent_invitation) {
    //   this.buildPage('Pass Request Sent', 'by ' +
    //     this.getUserName(this.wil.issuer), this.formatDateTime(this.wil.flow_start), (this.pagerPages + 1));
    //   this.buildPage('Pass Request Accepted', 'by ' +
    //     this.getUserName(this.wil.student), this.formatDateTime(this.wil.created), (this.pagerPages + 1));
    // } else if (this.wil.parent_request) {
    //   this.buildPage('Pass Request Sent', 'by ' +
    //     this.getUserName(this.wil.student), this.formatDateTime(this.wil.flow_start), (this.pagerPages + 1));
    //   this.buildPage('Pass Request Accepted', 'by ' +
    //     this.getUserName(this.wil.issuer), this.formatDateTime(this.wil.created), (this.pagerPages + 1));
    // } else if (this.forFuture && this.wil.issuer) {
    //   this.buildPage('Pass Created', 'by ' +
    //     this.getUserName(this.wil.issuer), this.formatDateTime(this.wil.created), (this.pagerPages + 1));
    // } else if (this.wil.issuer) {
    //   this.buildPage('Pass Created', 'by ' +
    //     this.getUserName(this.wil.issuer), this.formatDateTime(this.wil.created), (this.pagerPages + 1));
    // }

    // if (this.isActive) {
    //   this.buildPage('Pass Started', '', this.formatDateTime(this.wil.start_time), (this.pagerPages + 1));
    //   this.activePage = (this.pagerPages);
    // } else if (this.fromPast) {
    //   this.buildPage('Pass Started', '', this.formatDateTime(this.wil.start_time), (this.pagerPages + 1));
    //   const start: Date = this.wil.start_time;
    //   const end: Date = this.wil.end_time;
    //   const diff: number = (end.getTime() - start.getTime()) / 1000;
    //   const mins: number = Math.floor(Math.floor(diff) / 60);
    //   const secs: number = Math.abs(Math.floor(diff) % 60);
    //   const totalTime = mins + ':' + (secs < 10 ? '0' + secs : secs);
    //   this.buildPage('Pass Ended', '', totalTime + ' - Total Time', (this.pagerPages + 1));
    // }
  }

  buildPage(title: string, subtitle: string, stamp: string, page: number) {
    if (page === 1) {
      this.p1Title = title;
      this.p1Subtitle = subtitle;
      this.p1Stamp = stamp;
    } else if (page === 2) {
      this.p2Title = title;
      this.p2Subtitle = subtitle;
      this.p2Stamp = stamp;
    } else if (page === 3) {
      this.p3Title = title;
      this.p3Subtitle = subtitle;
      this.p3Stamp = stamp;
    } else if (page === 4) {
      this.p4Title = title;
      this.p4Subtitle = subtitle;
      this.p4Stamp = stamp;
    }
    this.pagerPages++;
  }

  chooseAction(action) {
    this.cancelOpen = false;
    if (action === 'delete') {
      const body = {};
      this.hallPassService.cancelPass(this.wil.id, body)
        .subscribe((httpData) => {
          this.dialogRef.close();
        });
    } else if (action === 'report') {
      this.dialogRef.close({'report': this.wil.student});
    } else if (action === 'end') {
      this.endPass();
    }
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
    if (this.forStaff) {
      let ss: User[] = this.selectedStudents;
      if (this.formState.data?.roomStudents?.length > 0) {
        ss = this.formState.data.roomStudents;
      }
      body['students'] = ss.map(user => user.id);
    } else {
      body['student'] = this.wil.student.id;
    }
    body['override_visibility'] = this.formState.data.roomOverride;

    // if (this.forFuture) {
    //   body['issuer_message'] = this.wil.issuer_message;
    //   body['start_time'] = this.wil.start_time.toISOString();
    // }
    if (this.forKioskMode) {
      body['self_issued'] = true;
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
    this.wilService.fakeWilActive.next(true);
    this.wilService.fakeWil.next(this.wil);
    this.performingAction = false;
    this.dialogRef.close();
  }

  endPass()
  {

  }
  genOption(display, color, action, icon?) {
    return {display: display, color: color, action: action, icon};
  }

}
