import {Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../models/User';
import {HallPass} from '../models/HallPass';
import {Util} from '../../Util';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';
import {LoadingService} from '../services/loading.service';
import {Navigation} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import {filter, map, pluck, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {BehaviorSubject, interval, merge, Observable, of, Subject, zip} from 'rxjs';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {HallPassesService} from '../services/hall-passes.service';
import {TimeService} from '../services/time.service';
import {ScreenService} from '../services/screen.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {School} from '../models/School';
import {DeviceDetection} from '../device-detection.helper';
import {scalePassCards} from '../animations';
import {DomCheckerService} from '../services/dom-checker.service';
import * as moment from 'moment';
import {UserService} from '../services/user.service';
import {ToastService} from '../services/toast.service';
import {EncounterPreventionService} from '../services/encounter-prevention.service';
import {isEmpty} from 'lodash';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.scss'],
  animations: [scalePassCards]
})
export class PassCardComponent implements OnInit, OnDestroy {

  @Input() pass: HallPass;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() isActive: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() forMonitor: boolean = false;
  @Input() forKioskMode: boolean = false;
  @Input() formState: Navigation;
  @Input() students: User[] = [];
  @Input() isOpenBigPass: boolean = false;
  @Input() fullScreenButton: boolean = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();
  @Output() scaleCard: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('cardWrapper') cardWrapper: ElementRef;

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 288;

  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen: boolean = false;
  selectedStudents: User[] = [];
  fromHistory;
  fromHistoryIndex;

  pagerPages = 0;

  timers: number[] = [];

  p1Title; p1Subtitle; p1Stamp;
  p2Title; p2Subtitle; p2Stamp;
  p3Title; p3Subtitle; p3Stamp;
  p4Title; p4Subtitle; p4Stamp;

  user: User;
  activePage;

  performingAction: boolean;
  isModal: boolean;
  showStudentInfoBlock: boolean = true;
  passForStudentsComponent: boolean;
  hideButton: boolean;

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


  constructor(
      public dialogRef: MatDialogRef<PassCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
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
  ) {}

  getUserName(user: any) {
    if (user instanceof User) {
      return user.isSameObject(this.user) ? 'Me' : user.first_name.substr(0, 1) + '. ' + user.last_name;
    } else {
      return user.first_name.substr(0, 1) + '. ' + user.last_name;
    }
  }

  get gradient() {
      return 'radial-gradient(circle at 73% 71%, ' + this.pass.color_profile.gradient_color + ')';
  }

  get studentText() {
      if (this.formState && this.formState.data.selectedGroup) {
          return this.formState.data.selectedGroup.title;
      } else {
          return (this.selectedStudents ?
              (this.selectedStudents.length > 2 ?
                  this.selectedStudents[0].display_name + ' and ' + (this.selectedStudents.length - 1) + ' more' :
                  this.selectedStudents[0].display_name + (this.selectedStudents.length > 1 ?
                  ' and ' + this.selectedStudents[1].display_name : '')) :
            this.pass.student.display_name + ` (${this.studentEmail})`);
      }
  }

  get studentEmail() {
    return this.pass.student.primary_email.split('@', 1)[0];
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  get closeIcon() {
    if (((this.isActive && this.forStaff) || this.forMonitor)){
      return './assets/Dots (Transparent).svg';
    } else {
      return './assets/' + (this.forInput ? 'Chevron Left ' : 'Delete ') + '(Transparent).svg';
    }
  }

  get hasClose() {
    return ((this.forInput || this.forStaff || this.pass.cancellable_by_student) && !this.fromPast) && !this.hideButton;
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
    this.currentSchool = this.userService.getUserSchool();
    this.isEnableProfilePictures$ = this.userService.isEnableProfilePictures$;

    if (this.data['pass']) {
      this.isModal = true;
      this.pass = this.data['pass'];
      console.log(moment(this.pass.start_time).format('DD MMMM YYYY hh:mm'));
      console.log(moment(this.pass.end_time).format('DD MMMM YYYY hh:mm'));
      console.log(moment(this.pass.expiration_time).format('DD MMMM YYYY hh:mm'));
      this.forInput = this.data['forInput'];
      this.isActive = this.data['isActive'];
      this.forFuture = this.data['forFuture'];
      this.fromPast = this.data['fromPast'];
      this.forStaff = this.data['forStaff'];
      this.selectedStudents = this.data['selectedStudents'];
      this.forMonitor = this.data['forMonitor'];
      this.fromHistory = this.data['fromHistory'];
      this.fromHistoryIndex = this.data['fromHistoryIndex'];
      this.activePassTime$ = this.data['activePassTime$'];
      this.showStudentInfoBlock = this.data['showStudentInfoBlock'];
      this.passForStudentsComponent = this.data['passForStudentsComponent'];
      this.hideButton = this.data['hasDeleteButton'];
    } else {
      this.selectedStudents = this.students;
    }

    this.userService.user$
      .pipe(map(user => User.fromJSON(user)), takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        this.buildPages();
      });

    if (!!this.pass && this.isActive) {
      merge(of(0), interval(1000)).pipe(
        tap(x => {
        const end: Date = this.pass.expiration_time;
        const now: Date = this.timeService.nowDate();
        const diff: number = (end.getTime() - now.getTime()) / 1000;
        const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        const secs: number = Math.abs(Math.floor(diff) % 60);
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
        this.valid = end > now;

        const start: Date = this.pass.start_time;
        const dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
        this.overlayWidth = (this.buttonWidth * (diff / dur));
      }), takeUntil(this.destroy$)).subscribe();
    }
    this.shortcutsService.onPressKeyEvent$
      .pipe(filter(() => this.forStaff), pluck('key'), takeUntil(this.destroy$))
      .subscribe(key => {
        if (key[0] === 'e') {
          this.endPass();
        } else if (key[0] === 'r') {
          this.dialogRef.close({'report': this.pass.student });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateDuration(dur: number) {
    this.returnData['duration'] = dur;
  }

  updateTravelType(travelType: string) {
    this.pass.travel_type = travelType;
  }

  formatDateTime(date: Date) {
    date = new Date(date);
    return Util.formatDateTime(date);
  }

  getDuration() {
    const start: Date = this.pass.start_time;
    const end: Date = this.pass.end_time;
    const timeDiff = Math.abs(start.getTime() - end.getTime());
    const diffSecs = Math.ceil(timeDiff / 1000);
    return Math.floor(diffSecs / 60) + ':' + (diffSecs % 60 < 10 ? '0' : '') + diffSecs % 60;
  }

  buildPages() {
    if (this.pass.parent_invitation) {
      this.buildPage('Pass Request Sent', 'by ' +
        this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.flow_start), (this.pagerPages + 1));
      this.buildPage('Pass Request Accepted', 'by ' +
        this.getUserName(this.pass.student), this.formatDateTime(this.pass.created), (this.pagerPages + 1));
    } else if (this.pass.parent_request) {
      this.buildPage('Pass Request Sent', 'by ' +
        this.getUserName(this.pass.student), this.formatDateTime(this.pass.flow_start), (this.pagerPages + 1));
      this.buildPage('Pass Request Accepted', 'by ' +
        this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages + 1));
    } else if (this.forFuture && this.pass.issuer ) {
       this.buildPage('Pass Created', 'by ' +
         this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages + 1));
    } else if (this.pass.issuer) {
      this.buildPage('Pass Created', 'by ' +
        this.getUserName(this.pass.issuer), this.formatDateTime(this.pass.created), (this.pagerPages + 1));
    }

    if (this.isActive) {
      this.buildPage('Pass Started', '', this.formatDateTime(this.pass.start_time), (this.pagerPages+1));
      this.activePage = (this.pagerPages);
    } else if (this.fromPast) {
      this.buildPage('Pass Started', '', this.formatDateTime(this.pass.start_time), (this.pagerPages+1));
      const start: Date = this.pass.start_time;
      const end: Date = this.pass.end_time;
      const diff: number = (end.getTime() - start.getTime()) / 1000;
      const mins: number = Math.floor(Math.floor(diff) / 60);
      const secs: number = Math.abs(Math.floor(diff) % 60);
      const totalTime = mins + ':' + (secs < 10 ? '0' + secs : secs);
      this.buildPage('Pass Ended', '', totalTime + ' - Total Time', (this.pagerPages + 1));
    }
  }

  buildPage(title: string, subtitle: string, stamp: string, page: number){
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

  newPass() {
    this.performingAction = true;
    const body = {
      'duration' : this.selectedDuration * 60,
      'origin' : this.pass.origin.id,
      'destination' : this.pass.destination.id,
      'travel_type' : this.selectedTravelType
    };
    if (this.forStaff) {
      body['students'] = this.selectedStudents.map(user => user.id);
    } else {
      body['student'] = this.pass.student.id;
    }

    if (this.forFuture) {
        body['issuer_message'] = this.pass.issuer_message;
        body['start_time'] = this.pass.start_time.toISOString();
    }
    if (this.forKioskMode) {
        body['self_issued'] = true;
    }
     const getRequest$ = this.forStaff ? this.hallPassService.bulkCreatePass(body) : this.hallPassService.createPass(body);
      getRequest$.pipe(
        takeUntil(this.destroy$),
        switchMap(({conflict_student_ids, passes}) => {
          if (conflict_student_ids) {
            if (!this.forStaff) {
              this.toastService.openToast({
                title: 'Sorry, you can’t start your pass right now.',
                subtitle: 'Please try again later.',
                type: 'error',
                encounterPrevention: true,
                exclusionPass: {...this.pass, travel_type: this.selectedTravelType}
              });
              this.dialogRef.close();
              return of(null);
            } else {
              return zip(...conflict_student_ids.map(id => {
                return this.encounterService.getExclusionGroupsForStudentRequest(id)
                  .pipe(
                    filter(r => !isEmpty(r) && !!r[+id]),
                    take(1),
                    tap((groups) => {
                      console.log(11111);
                      const exclusionGroups = groups[+id];
                      this.toastService.openToast({
                        title: 'This pass can’t start now to prevent encounter.',
                        subtitle: 'These students can’t have a pass at the same time.',
                        type: 'error',
                        encounterPrevention: true,
                        exclusionPass: {...this.pass, travel_type: this.selectedTravelType, student: this.selectedStudents.find(user => +user.id === +id)},
                        exclusionGroups
                      });
                    }));
              }));
            }
          }
          return of(null);
        })
      )
      .subscribe((data) => {
        this.performingAction = true;
        this.dialogRef.close();
      });
  }

  cancelEdit(evt: MouseEvent) {
    if (!this.cancelOpen) {
      const target = new ElementRef(evt.currentTarget);
      this.options = [];
      this.header = '';

      if ((this.isActive && this.forStaff) || this.forMonitor) {

        if (this.user.isTeacher() && !this.data['hideReport']) {
          this.options.push(this.genOption('Report Student', '#E32C66', 'report'));
        }
        this.options.push(this.genOption('End Pass', '#E32C66', 'end'));

        this.header = '';
      } else {
        if (this.forInput) {
            this.formState.step = 3;
              this.formState.previousStep = 4;
              this.formService.setFrameMotionDirection('disable');
              this.cardEvent.emit(this.formState);
            return false;
        } else if (this.forFuture) {
          this.options.push(this.genOption('Delete Scheduled Pass','#E32C66','delete', './assets/Delete (Red).svg'));
          this.header = 'Are you sure you want to delete this scheduled pass?';
        }
      }

        UNANIMATED_CONTAINER.next(true);
        this.cancelOpen = true;
        const cancelDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: {'header': this.header, 'options': this.options, 'trigger': target}
        });

        cancelDialog.afterClosed()
          .pipe(
            tap(() => UNANIMATED_CONTAINER.next(false))
          )
          .subscribe(action => {
          this.chooseAction(action);
        });

    }
  }

  chooseAction(action) {
    this.cancelOpen = false;
    if (action === 'delete') {
      const body = {};
      this.hallPassService.cancelPass(this.pass.id, body)
        .subscribe((httpData) => {
        this.dialogRef.close();
      });
    } else if (action === 'report') {
      this.dialogRef.close({'report': this.pass.student });
    } else if (action === 'end') {
      this.endPass();
    }
  }

  endPass() {
    this.hallPassService.endPass(this.pass.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  genOption(display, color, action, icon?) {
    return {display: display, color: color, action: action, icon};
  }

  backdropClick() {
    this.cancelEditClick = false;
  }

  receiveOption(action) {
    this.chooseAction(action);
  }

  openBigPassCard() {
    this.scaleCard.emit(true);
  }
}
