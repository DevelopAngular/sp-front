import {Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Request} from '../models/Request';
import {User} from '../models/User';
import {Util} from '../../Util';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConsentMenuComponent} from '../consent-menu/consent-menu.component';
import {Navigation} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import {getInnerPassName} from '../pass-tile/pass-display-util';
import {DataService} from '../services/data-service';
import {LoadingService} from '../services/loading.service';
import {filter, pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {RequestsService} from '../services/requests.service';
import {NextStep, scalePassCards} from '../animations';
import {BehaviorSubject, interval, Observable, of, Subject} from 'rxjs';

import * as moment from 'moment';
import {isNull, uniq, uniqBy} from 'lodash';
import {ScreenService} from '../services/screen.service';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {DeviceDetection} from '../device-detection.helper';
import {KeyboardShortcutsService} from '../services/keyboard-shortcuts.service';
import {StorageService} from '../services/storage.service';
import {NavbarDataService} from '../main/navbar-data.service';
import {DomCheckerService} from '../services/dom-checker.service';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
  animations: [NextStep, scalePassCards]
})
export class RequestCardComponent implements OnInit, OnDestroy {

  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() formState: Navigation;
  @Input() isOpenBigPass: boolean;
  @Input() fullScreenButton: boolean = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() scaleCard: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('cardWrapper') cardWrapper: ElementRef;

  selectedDuration: number;
  selectedTravelType: string;
  selectedStudents;
  fromHistory;
  fromHistoryIndex;
  messageEditOpen: boolean = false;
  dateEditOpen: boolean = false;
  cancelOpen: boolean = false;
  pinnableOpen: boolean = false;
  user: User;
  isSeen: boolean;

  isModal: boolean;

  nowTeachers;
  futureTeachers;

  performingAction: boolean;
  frameMotion$: BehaviorSubject<any>;
  options: any[];
  header: string;
  cancelEditClick: boolean;

  hoverDestroyer$: Subject<any>;

  activeTeacherPin: boolean = false;
  solidColorRgba: string;
  solidColorRgba2: string;
  removeShadow: boolean;
  leftTextShadow: boolean;

  scaleCardTrigger$: Observable<string>;

  destroy$: Subject<any> = new Subject<any>();


  constructor(
      public dialogRef: MatDialogRef<RequestCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private requestService: RequestsService,
      public dialog: MatDialog,
      public dataService: DataService,
      private _zone: NgZone,
      private loadingService: LoadingService,
      private createFormService: CreateFormService,
      public screenService: ScreenService,
      private shortcutsService: KeyboardShortcutsService,
      private navbarData: NavbarDataService,
      private storage: StorageService,
      private domCheckerService: DomCheckerService
  ) {}

  get invalidDate() {
    return Util.invalidDate(this.request.request_time);
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  get teacherNames() {
      const destination = this.request.destination;
      const origin = this.request.origin;
      if (destination.scheduling_request_mode === 'all_teachers_in_room') {
          if (destination.scheduling_request_send_origin_teachers && destination.scheduling_request_send_destination_teachers) {
              return [...destination.teachers, ...origin.teachers];
          } else if (destination.scheduling_request_send_origin_teachers) {
              return origin.teachers;
          } else if (destination.scheduling_request_send_destination_teachers) {
              return destination.teachers;
          }
      }
      return [this.request.teacher];
  }

  get filteredTeachers() {
    return uniqBy(this.teacherNames, 'id');
  }

  get iconClass() {
    return  this.forStaff || this.invalidDate || !this.forStaff && !this.forInput && !this.invalidDate ? '' : 'icon-button';
  }

  ngOnInit() {
    this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
    this.frameMotion$ = this.createFormService.getFrameMotionDirection();

    if (this.data['pass']) {
      this.isModal = true;
      this.request = this.data['pass'];
      this.forInput = this.data['forInput'];
      this.forFuture = this.data['forFuture'];
      this.fromPast = this.data['fromPast'];
      this.forStaff = this.data['forStaff'];
      this.selectedStudents = this.data['selectedStudents'];
      this.fromHistory = this.data['fromHistory'];
      this.fromHistoryIndex = this.data['fromHistoryIndex'];
    }

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        pluck('key'),
        takeUntil(this.destroy$)
      )
      .subscribe(key => {
        if (key[0] === 'a') {
          this.approveRequest();
        } else if (key[0] === 'd') {
          this.denyRequest('');
        }
      });

    this.dataService.currentUser
    .pipe(
      this.loadingService.watchFirst,
      takeUntil(this.destroy$)
    )
    .subscribe(user => {
      this._zone.run(() => {
        this.user = user;
      });
    });
    this.createFormService.isSeen$.subscribe(res => this.isSeen = res);
    if (this.isModal) {
      this.solidColorRgba = Util.convertHex(this.request.gradient_color.split(',')[0], 100);
      this.solidColorRgba2 = Util.convertHex(this.request.gradient_color.split(',')[1], 100);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getGradient() {
    if (this.request.gradient_color) {
      const gradient: string[] = this.request.gradient_color.split(',');
      return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
    }
  }

  get studentName() {
    return getInnerPassName(this.request);
  }

  get teacherName() {
    return this.request.teacher.isSameObject(this.user) ? 'Me' : this.request.teacher.first_name.substr(0, 1) + '. ' + this.request.teacher.last_name;
  }

  get gradient() {
      return 'radial-gradient(circle at 73% 71%, ' + this.request.color_profile.gradient_color + ')';
  }

  get status() {
    return this.request.status.charAt(0).toUpperCase() + this.request.status.slice(1);
  }

  get isFutureOrNowTeachers() {
      const to = this.formState.data.direction.to;
      if ((!this.formState.forLater && to.request_mode !== 'any_teacher') || (this.formState.forLater && to.scheduling_request_mode !== 'any_teacher') ) {
        return to && (!this.formState.forLater && to.request_mode === 'all_teachers_in_room' || to.request_mode === 'specific_teachers' ||
          (to.request_mode === 'teacher_in_room' && to.teachers.length === 1)) ||
          (this.formState.forLater && to.scheduling_request_mode === 'all_teachers_in_room' || to.scheduling_request_mode === 'specific_teachers' ||
            to.scheduling_request_mode === 'teacher_in_room' && to.teachers.length === 1);
      }
  }

  generateTeachersToRequest() {
      const to = this.formState.data.direction.to;
      if (!this.forFuture) {
          if (to.request_mode === 'all_teachers_in_room') {
              if (to.request_send_destination_teachers && to.request_send_origin_teachers) {
                  this.nowTeachers = [...this.formState.data.direction.to.teachers, ...this.formState.data.direction.from.teachers];
              } else if (to.request_send_destination_teachers) {
                  this.nowTeachers = this.formState.data.direction.to.teachers;
              } else if (to.request_send_origin_teachers) {
                  this.nowTeachers = this.formState.data.direction.from.teachers;
              }
          } else if (to.request_mode === 'specific_teachers' && this.request.destination.request_teachers.length === 1) {
            this.nowTeachers = to.request_teachers;
          } else if (to.request_mode === 'specific_teachers') {
              this.nowTeachers = [this.request.teacher];
          } else if (to.request_mode === 'teacher_in_room' && to.teachers.length === 1) {
            this.nowTeachers = [this.request.teacher];
          }
      } else {
          if (to.scheduling_request_mode === 'all_teachers_in_room') {
              if (to.scheduling_request_send_origin_teachers && to.scheduling_request_send_destination_teachers) {
                  this.futureTeachers = [...this.formState.data.direction.to.teachers, ...this.formState.data.direction.from.teachers];
              } else if (to.scheduling_request_send_origin_teachers) {
                  this.futureTeachers = this.formState.data.direction.from.teachers.length ? this.formState.data.direction.from.teachers : this.formState.data.direction.to.teachers;
              } else if (to.scheduling_request_send_destination_teachers) {
                  this.futureTeachers = this.formState.data.direction.to.teachers;
              }
          } else if (to.scheduling_request_mode === 'specific_teachers' && this.request.destination.scheduling_request_teachers.length === 1) {
              this.futureTeachers = this.request.destination.scheduling_request_teachers;
          } else if (to.scheduling_request_mode === 'specific_teachers' && this.request.destination.scheduling_request_teachers.length > 1) {
            this.futureTeachers = [this.request.teacher];
          } else if (to.scheduling_request_mode === 'teacher_in_room' && to.teachers.length === 1) {
            this.futureTeachers = [this.request.teacher];
          }
      }
  }

  formatDateTime(date: Date, timeOnly?: boolean) {
    return Util.formatDateTime(date, timeOnly);
  }

  newRequest() {
    this.performingAction = true;
    this.generateTeachersToRequest();
      const body: any = this.forFuture ? {
          'origin' : this.request.origin.id,
          'destination' : this.request.destination.id,
          'attachment_message' : this.request.attachment_message,
          'travel_type' : this.selectedTravelType,
          'request_time' : this.request.request_time.toISOString(),
          'duration' : this.selectedDuration * 60,
        } : {
          'origin' : this.request.origin.id,
          'destination' : this.request.destination.id,
          'attachment_message' : this.request.attachment_message,
          'travel_type' : this.selectedTravelType,
          'duration' : this.selectedDuration * 60,
        };
    if (this.isFutureOrNowTeachers) {
          if (this.forFuture) {
              body.teachers = uniq(this.futureTeachers.map(t => t.id));
          } else {
              body.teachers = uniq(this.nowTeachers.map(t => t.id));
          }
      } else {
          body.teacher = this.request.teacher.id;
      }

      if (this.forStaff) {
         const invitation = {
              'students' : this.request.student.id,
              'default_origin' : this.request.origin.id,
              'destination' : +this.request.destination.id,
              'date_choices' : [new Date(this.formState.data.date.date).toISOString()],
              'duration' : this.request.duration,
              'travel_type' : this.request.travel_type
          };

          this.requestService.createInvitation(invitation).pipe(
            takeUntil(this.destroy$),
            switchMap(() => {
              return this.requestService.cancelRequest(this.request.id);
          })).subscribe(res => {
              this.performingAction = true;
              this.dialogRef.close();
          });
      } else {
      this.requestService.createRequest(body).pipe(
          takeUntil(this.destroy$),
          switchMap(res => {
              return this.formState.previousStep === 1 ? this.requestService.cancelRequest(this.request.id) :
                  (this.formState.missedRequest ? this.requestService.cancelInvitation(this.formState.data.request.id, '') : of(null));
          }))
        .subscribe((res) => {
          this.performingAction = true;
          if ((DeviceDetection.isAndroid() || DeviceDetection.isIOSMobile()) && this.forFuture) {
            this.dataService.openRequestPageMobile();
            this.navbarData.inboxClick$.next(true);
          }
          this.dialogRef.close();
      });
      }
  }

  changeDate(resend_request?: boolean) {
    if (!this.dateEditOpen) {
      this.dateEditOpen = true;
      let config;
      this.dialogRef.close();
      config = {
          panelClass: 'form-dialog-container',
          maxWidth: '100vw',
          backdropClass: 'custom-backdrop',
          data: {
              'entryState': {
                  step: 1,
                  state: 1
              },
              'forInput': false,
              'originalToLocation': this.request.destination,
              'colorProfile': this.request.color_profile,
              'originalFromLocation': this.request.origin,
              'request_time': resend_request || this.invalidDate ? new Date() : this.request.request_time,
              'request': this.request,
              'resend_request': resend_request
          }
      };
      const dateDialog = this.dialog.open(CreateHallpassFormsComponent, config);

      dateDialog.afterClosed().pipe(
        tap(() => this.dateEditOpen = false),
        filter((state) => resend_request && state),
        switchMap((state) => {
          const body: any = {
              'origin' : this.request.origin.id,
              'destination' : this.request.destination.id,
              'attachment_message' : this.request.attachment_message,
              'travel_type' : this.request.travel_type,
              'teacher' : this.request.teacher.id,
              'duration' : this.request.duration,
              'request_time': moment(state.data.date.date).toISOString()
          };

         return this.requestService.createRequest(body);
        }),
        switchMap(() => this.requestService.cancelRequest(this.request.id))
      ).subscribe();
    }
  }

  editMessage() {
    if (!this.messageEditOpen) {
      this.messageEditOpen = true;
      const infoDialog = this.dialog.open(CreateHallpassFormsComponent, {
        width: '750px',
        maxWidth: '100vw',
        panelClass: 'form-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'entryState': 'restrictedMessage',
              'originalMessage': this.request.attachment_message,
              'originalToLocation': this.request.destination,
              'colorProfile': this.request.color_profile,
              'originalFromLocation': this.request.origin}
      });

      infoDialog.afterClosed().subscribe(data =>{
        this.request.attachment_message = data['message']===''?this.request.attachment_message:data['message'];
        this.messageEditOpen = false;
      });
    }
  }

  cancelRequest(evt: MouseEvent) {
    // if (this.screenService.isDeviceMid) {
    //   this.cancelEditClick = !this.cancelEditClick;
    // }

    if(!this.cancelOpen) {
      const target = new ElementRef(evt.currentTarget);
      this.options = [];
      this.header = '';
      if (!this.forInput) {
        if (this.forStaff) {
          this.options.push(this.genOption('Attach Message & Deny', '#7f879d', 'deny_with_message', './assets/Message (Blue-Gray).svg'));
          this.options.push(this.genOption('Deny Pass Request', '#E32C66', 'deny', './assets/Cancel (Red).svg', 'rgba(227, 44, 102, .1)', 'rgba(227, 44, 102, .15)'));
        } else {
          if (this.invalidDate) {
            this.options.push(this.genOption('Change Date & Time to Resend', '#7f879d', 'change_date'));
          }
          this.options.push(this.genOption('Delete Pass Request', '#E32C66', 'delete', './assets/Delete (Red).svg', 'rgba(227, 44, 102, .1)', 'rgba(227, 44, 102, .15)'));
        }
        this.header = 'Are you sure you want to ' + (this.forStaff ? 'deny' : 'delete') + ' this pass request' + (this.forStaff ? '' : ' you sent') + '?';
      } else {
        if (!this.pinnableOpen) {
            this.formState.step = this.formState.previousStep === 1 ? 1 : 3;
            this.formState.previousStep = 4;
            this.createFormService.setFrameMotionDirection('disable');
            this.cardEvent.emit(this.formState);
        }
        return false;
      }

      // if (!this.screenService.isDeviceMid) {
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
    // }

    }
  }

  chooseAction(action) {
    this.cancelOpen = false;
    if (action === 'cancel' || action === 'stop') {
      this.dialogRef.close();
    } else if (action === 'editMessage') {
      this.editMessage();
    } else if (action === 'deny_with_message') {
      let denyMessage: string = '';
      if (action.indexOf('Message') > -1) {

      } else {
        this.messageEditOpen = true;
        let config;
          config = {
            panelClass: 'form-dialog-container',
            backdropClass: 'invis-backdrop',
            data: {
              'forInput': false,
              'entryState': {step: 3, state: 5},
              'teacher': this.request.teacher,
              'originalMessage': '',
              'originalToLocation': this.request.destination,
              'colorProfile': this.request.color_profile,
              'gradient': this.request.gradient_color,
              'originalFromLocation': this.request.origin,
              'isDeny': true,
              'studentMessage': this.request.attachment_message
            }
          };
        const messageDialog = this.dialog.open(CreateHallpassFormsComponent, config);

        messageDialog.afterClosed().pipe(filter(res => !!res)).subscribe(matData => {
          // denyMessage = data['message'];
          if (isNull(matData.data.message)) {
            this.messageEditOpen = false;
            return;
          }
          if (matData.data && matData.data.message) {
            denyMessage = matData.data.message;
            this.messageEditOpen = false;
            console.log('DENIED =====>', matData, action);
            this.denyRequest(denyMessage);
          } else {
            denyMessage = matData.message;
            this.messageEditOpen = false;
            this.denyRequest(denyMessage);
          }
        });
        return;
      }
    } else if (action === 'deny') {
      this.denyRequest('No message');

    } else if (action === 'delete') {
      this.requestService.cancelRequest(this.request.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          const storageData = JSON.parse(this.storage.getItem('pinAttempts'));
          if (storageData && storageData[this.request.id]) {
            delete storageData[this.request.id];
            this.storage.setItem('pinAttempts', JSON.stringify({...storageData}));
          }
        this.dialogRef.close();
      });
    } else if (action === 'change_date') {
      this.changeDate(true);
    }
  }

  denyRequest(denyMessage: string) {
    const body = {
      'message' : denyMessage
    };
    this.requestService.denyRequest(this.request.id, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe((httpData) => {
      this.dialogRef.close();
    });
  }

  genOption(display, color, action, icon?, hoverBackground?, clickBackground?) {
    return { display, color, action, icon, hoverBackground, clickBackground };
  }

  approveRequest() {
    this.performingAction = true;
    const body = [];
    this.requestService.acceptRequest(this.request.id, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      this.dialogRef.close();
    });
  }

  cancelClick() {
    this.cancelEditClick = false;
  }

  backdropClick() {
    this.cancelEditClick = false;
  }

  receiveOption(action) {
    this.chooseAction(action);
    this.dialogRef.close();
  }

  onHover(evt: HTMLElement, container: HTMLElement) {
    this.hoverDestroyer$ = new Subject<any>();
    const target = evt;
    target.style.width = `auto`;
    target.style.transition = `none`;

    const targetWidth = target.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;

    let margin = 0;
    interval(35)
      .pipe(
        takeUntil(this.hoverDestroyer$)
      )
      .subscribe(() => {
        if (margin > 0) {
          this.leftTextShadow = true;
        }
        if ((targetWidth - margin) > containerWidth) {
          target.style.marginLeft = `-${margin}px`;
          margin++;
        } else {
          this.removeShadow = true;
        }
      });
  }

  onLeave(target: HTMLElement) {
    target.style.marginLeft = this.filteredTeachers.length > 1 ? '0px' : '15px';
    target.style.transition = `margin-left .4s ease`;
    target.style.width = `auto`;
    this.removeShadow = false;
    this.leftTextShadow = false;
    this.hoverDestroyer$.next();
    this.hoverDestroyer$.complete();
  }

  goToPin() {
    this.activeTeacherPin = true;
  }

  openBigPassCard() {
    this.scaleCard.emit(true);
  }
}
