import {Component, OnInit, Input, ElementRef, NgZone, Output, EventEmitter} from '@angular/core';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { Inject } from '@angular/core';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { Navigation } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { getInnerPassName } from '../pass-tile/pass-display-util';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import {filter, switchMap, tap} from 'rxjs/operators';
import {InvitationCardComponent} from '../invitation-card/invitation-card.component';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import * as _ from 'lodash';
import {RequestsService} from '../services/requests.service';
import {NextStep} from '../animations';
import {BehaviorSubject, of} from 'rxjs';

import * as moment from 'moment';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
  animations: [NextStep]
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() formState: Navigation;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter<any>();

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


  constructor(
      public dialogRef: MatDialogRef<RequestCardComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private requestService: RequestsService,
      public dialog: MatDialog,
      public dataService: DataService,
      private _zone: NgZone,
      private loadingService: LoadingService,
      private createFormService: CreateFormService
  ) {}

  get invalidDate() {
    return Util.invalidDate(this.request.request_time);
  }

  ngOnInit() {
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

      this.dataService.currentUser
    .pipe(this.loadingService.watchFirst)
    .subscribe(user => {
      this._zone.run(() => {
        this.user = user;
        this.forStaff = user.roles.includes('_profile_teacher');
      });
    });
    this.createFormService.isSeen$.subscribe(res => this.isSeen = res);
  }

  get studentName(){
    return getInnerPassName(this.request);
  }

  get teacherName(){
    return this.request.teacher.isSameObject(this.user)?'Me':this.request.teacher.first_name.substr(0, 1) +'. ' +this.request.teacher.last_name;
  }

    get gradient() {
        return 'radial-gradient(circle at 73% 71%, ' + this.request.color_profile.gradient_color + ')';
    }

  get status(){
    return this.request.status.charAt(0).toUpperCase() + this.request.status.slice(1);
  }

  get isFutureOrNowTeachers() {
      const to = this.formState.data.direction.to;
      return to && (!this.formState.forLater && to.request_mode === 'all_teachers_in_room' || to.request_mode === 'specific_teachers') ||
          (this.formState.forLater && to.scheduling_request_mode === 'all_teachers_in_room' || to.scheduling_request_mode === 'specific_teachers');
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
          } else if (to.request_mode === 'specific_teachers') {
              this.nowTeachers = this.formState.data.direction.to.request_teachers;
          }
      } else {
          if (to.scheduling_request_mode === 'all_teachers_in_room') {
              if (to.scheduling_request_send_origin_teachers && to.scheduling_request_send_destination_teachers) {
                  this.futureTeachers = [...this.formState.data.direction.to.teachers, ...this.formState.data.direction.from.teachers];
              } else if (to.scheduling_request_send_origin_teachers) {
                  this.futureTeachers = this.formState.data.direction.from.teachers;
              } else if (to.scheduling_request_send_destination_teachers) {
                  this.futureTeachers = this.formState.data.direction.to.teachers;
              }
          } else if (to.scheduling_request_mode === 'specific_teachers') {
              this.futureTeachers = this.formState.data.direction.to.scheduling_request_teachers;
          }
      }
  }

  formatDateTime(date: Date, timeOnly?: boolean){
    return Util.formatDateTime(date, timeOnly);
  }
  // log(arg) {
  //   console.log(arg);
  // }
  newRequest(){
    this.performingAction = true;
    this.generateTeachersToRequest();
      let body: any = this.forFuture ? {
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
          'duration' : this.selectedDuration*60,
        };
      if (this.isFutureOrNowTeachers) {
          if (this.forFuture) {
              body.teachers = this.futureTeachers.map(t => t.id);
          } else {
              body.teachers = this.nowTeachers.map(t => t.id);
          }
      } else {
          body.teacher = this.request.teacher.id;
      }
      this.requestService.createRequest(body).pipe(switchMap(res => {
          return this.formState.previousStep === 1 ? this.requestService.cancelRequest(this.request.id) :
           (this.formState.missedRequest ? this.requestService.cancelInvitation(this.formState.data.request.id, '') : of(null));
      })).subscribe((res) => {
          this.performingAction = true;
          this.dialogRef.close();
      });
  }

  changeDate(resend_request?: boolean) {
    if (!this.dateEditOpen) {
       let config;
            this.dialogRef.close();
            config = {
                panelClass: 'form-dialog-container',
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

      dateDialog.afterOpen().subscribe( () => {
        this.dateEditOpen = true;
      });

      dateDialog.afterClosed().pipe(filter((state) => resend_request && state), switchMap((state) => {
          const body: any = {
              'origin' : this.request.origin.id,
              'destination' : this.request.destination.id,
              'attachment_message' : this.request.attachment_message,
              'travel_type' : this.request.travel_type,
              'teacher' : this.request.teacher.id,
              'duration' : this.request.duration,
              'request_time': moment(state.data.date.date).format('YYYY-MM-DDThh:mm')
          };

         return this.requestService.createRequest(body);
      }), switchMap(() => this.requestService.cancelRequest(this.request.id)))
          .subscribe(console.log);
    }
  }

  editMessage(){
    if(!this.messageEditOpen) {
      const infoDialog = this.dialog.open(CreateHallpassFormsComponent, {
        width: '750px',
        panelClass: 'form-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'entryState': 'restrictedMessage',
              'originalMessage': this.request.attachment_message,
              'originalToLocation': this.request.destination,
              'colorProfile': this.request.color_profile,
              'originalFromLocation': this.request.origin}
      });

      infoDialog.afterOpen().subscribe( () => {
        this.messageEditOpen = true;
      });

      infoDialog.afterClosed().subscribe(data =>{
        this.request.attachment_message = data['message']===''?this.request.attachment_message:data['message'];
        this.messageEditOpen = false;
      });
    }
  }

  cancelRequest(evt: MouseEvent){
    if(!this.cancelOpen){
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';
      if(!this.forInput){
        if(this.forStaff){
          options.push(this.genOption('Attach Message & Deny','#3D396B','deny_with_message'));
          options.push(this.genOption('Deny Pass Request','#E32C66','deny'));
        } else{
            if (this.invalidDate) {
              options.push(this.genOption('Change Date & Time to Resend', '#3D396B', 'change_date'));
            }
          options.push(this.genOption('Delete Pass Request','#E32C66','delete'));
        }
        header = 'Are you sure you want to ' +(this.forStaff?'deny':'delete') +' this pass request' +(this.forStaff?'':' you sent') +'?';
      } else{
          if (!this.pinnableOpen) {
            if (this.isSeen) {
                this.formState.step = this.formState.previousStep === 1 ? 1 : 3;
                this.formState.previousStep = 4;
                this.cardEvent.emit(this.formState);
            } else {
                this.dialogRef.close();
                  const dialogRef = this.dialog.open(CreateHallpassFormsComponent, {
                      width: '750px',
                      panelClass: 'form-dialog-container',
                      backdropClass: 'custom-backdrop',
                      data: {
                          'fromLocation': this.request.origin,
                          'fromHistory': this.fromHistory,
                          'fromHistoryIndex': this.fromHistoryIndex,
                          'colorProfile': this.request.color_profile,
                          'forLater': this.forFuture,
                          'forStaff': this.forStaff,
                          'selectedStudents': this.selectedStudents,
                          'toLocation': this.request.destination,
                          'requestTarget': this.request.teacher,
                          'toIcon': this.request.icon
                      }
                  });
                  dialogRef.afterClosed().pipe(filter(res => !!res)).subscribe((result: Object) => {
                     this.openInputCard(result['templatePass'],
                        result['forLater'],
                        result['forStaff'],
                        result['selectedStudents'],
                        (result['type'] === 'hallpass' ? PassCardComponent : (result['type'] === 'request' ? RequestCardComponent : InvitationCardComponent)),
                        result['fromHistory'],
                        result['fromHistoryIndex']
                  );
              });
            }
          }
          return false;
      }
      const cancelDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': header, 'options': options, 'trigger': target}
      });

      cancelDialog.afterOpen().subscribe( () =>{
        this.cancelOpen = true;
      });

      cancelDialog.afterClosed()
          .subscribe(action => {
            this.cancelOpen = false;
            if (!action) {
              return false;
            }
        console.log('DENIED with message ===>', action);
        if(action === 'cancel' || action === 'stop'){
          this.dialogRef.close();
        } else if(action === 'editMessage'){
          this.editMessage();
        }else if(action.indexOf('deny_with_message') === 0) {
          let denyMessage: string = '';
          if(action.indexOf('Message') > -1) {

          } else {
            let config;
            if (this.isSeen) {
                config = {
                    panelClass: 'form-dialog-container',
                    backdropClass: 'invis-backdrop',
                    data: {
                        'forInput': false,
                        'entryState': { step: 3, state: 5 },
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
            }
            const messageDialog = this.dialog.open(CreateHallpassFormsComponent, config);

              messageDialog.afterOpen().subscribe( () => {
                  this.messageEditOpen = true;
              });

              messageDialog.afterClosed().pipe(filter(res => !!res)).subscribe(matData => {
                  // denyMessage = data['message'];
                  if (_.isNull(matData.data.message)) {
                      this.messageEditOpen = false;
                      return;
                  }
                  if (matData.data && matData.data.message) {
                    denyMessage = matData.data.message;
                    this.messageEditOpen = false;
                    console.log('DENIED =====>', matData, action);
                    // debugger;
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
            this.requestService.cancelRequest(this.request.id).subscribe(() => {
              this.dialogRef.close();
            });
        } else if (action === 'change_date') {
            this.changeDate(true);
        }
      });
    }
  }

  openInputCard(templatePass, forLater, forStaff, selectedStudents, component, fromHistory, fromHistoryIndex) {
     const data = {
       'pass': templatePass,
       'fromPast': false,
       'fromHistory': fromHistory,
       'fromHistoryIndex': fromHistoryIndex,
       'forFuture': forLater,
       'forInput': true,
       'forStaff': forStaff,
       'selectedStudents': selectedStudents,
    };
    this.dialog.open(component, {
       panelClass: (forStaff ? 'teacher-' : 'student-') + 'pass-card-dialog-container',
       backdropClass: 'custom-backdrop',
       disableClose: true,
       data: data
    });
    }

  denyRequest(denyMessage: string){
    const body = {
      'message' : denyMessage
    };
    this.requestService.denyRequest(this.request.id, body).subscribe((httpData) => {
      console.log('[Request Denied]: ', httpData);
      this.dialogRef.close();
    });
  }

  genOption(display, color, action) {
    return {display: display, color: color, action: action};
  }

  approveRequest() {
    this.performingAction = true;
    const body = [];
    this.requestService.acceptRequest(this.request.id, body).subscribe(() => {
      this.dialogRef.close();
    });
  }
}
