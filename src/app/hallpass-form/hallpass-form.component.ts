import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';
import { ColorProfile } from '../models/ColorProfile';
import { Duration } from '../models/Duration';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Location } from '../models/Location';
import { Pinnable } from '../models/Pinnable';
import { Request } from '../models/Request';
import { User } from '../models/User';
import {StudentList} from '../models/StudentList';



export enum Role { Teacher = 1, Student = 2 }

export enum FormFactor { HallPass = 1, Request = 2, Invitation = 3 }

export interface FormMode {
  role?: number;
  formFactor?: number;
}

export interface Navigation {
  step: number;
  previousStep?: number;
  state?: number|string;
  fromState?: number;
  formMode?: FormMode;
  data?: {
    date?: any;
    selectedStudents?: User[];
    selectedGroup?: StudentList;
    direction?: {
      from: Location;
      to: Location;
      pinnable?: Pinnable;
      // restricted?: boolean;
    },
    icon?: string
    gradient?: string;
    message?: string,
    requestTarget?: User,
    hasClose?: boolean
  };
  forInput?: boolean;
}



@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.scss']
})
export class HallpassFormComponent implements OnInit {

  public FORM_STATE: Navigation;
  public animateNextStep: number;
  public animatePrevStep: number;
  public stepTransition: Object = {
    'state-transition__left-right': false,
    'state-transition__right-left': false
  };

  constructor(
    private http: HttpService,
    private dataService: DataService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<HallpassFormComponent>,
  ) {}

  ngOnInit() {
    this.FORM_STATE = {
      step: null,
      previousStep: 0,
      state: 1,
      fromState: null,
      formMode: {
        role: null,
        formFactor: null,
      },
      data: {},
      forInput: this.dialogData['forInput'] || false
    };

    switch (this.dialogData['forInput']) {
      case (true): {

        this.FORM_STATE.formMode.role = this.dialogData['forStaff'] ? Role.Teacher : Role.Student;

        if ( this.dialogData['forLater'] ) {

          this.FORM_STATE.step = 1;

          if ( this.dialogData['forStaff'] ) {
            this.FORM_STATE.formMode.formFactor = FormFactor.Invitation;
          } else {
            this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;
          }

        } else {

          this.FORM_STATE.formMode.formFactor = FormFactor.HallPass;

          if ( this.dialogData['forStaff'] ) {
            this.FORM_STATE.step = 2;
            // this.FORM_STATE.state = 1;
          } else {
            this.FORM_STATE.step = 3;
            // this.FORM_STATE.state = 1;
          }
        }

        break;

      }
      case (false): {
        if (this.dialogData['hasClose']) {
         this.FORM_STATE.data.hasClose = true;
        }
        this.FORM_STATE.formMode.formFactor = FormFactor.Request;
        this.FORM_STATE.formMode.role = this.dialogData['isDeny'] ? Role.Teacher : Role.Student;
        this.FORM_STATE.step = this.dialogData['entryState'].step;
        this.FORM_STATE.state = this.dialogData['entryState'].state;
        this.FORM_STATE.data.date = {
          date: this.dialogData['request_time']
        };
        this.FORM_STATE.data.requestTarget = this.dialogData['teacher'];
        this.FORM_STATE.data.gradient = this.dialogData['gradient'];
        this.FORM_STATE.data.direction = {
          from: this.dialogData['originalFromLocation'],
          to: this.dialogData['originalToLocation']
        };

        break;
      }
    }

  }

  onNextStep(evt) {
    if (evt.step === 0 || evt.action === 'exit') {
      console.log('EXIT ===>', evt);
      this.dialogRef.close(evt);
      return;
    } else {
      console.log('STEP EVENT ===== ===>', evt);

      this.stepTransition['state-transition__left-right'] = this.FORM_STATE.previousStep < this.FORM_STATE.step;
      this.stepTransition['state-transition__right-left'] = this.FORM_STATE.previousStep > this.FORM_STATE.step;
      this.FORM_STATE = evt;
    }
  }

  // private updateTransition() {
  //   return
  // }
}

// @Component({
//   selector: 'app-hallpass-form',
//   templateUrl: './hallpass-form.component.html',
//   styleUrls: ['./hallpass-form.component.scss']
// })
// export class HallpassFormComponent implements OnInit {
//   // General Set-Up
//   public isLoggedIn: Boolean = false;
//   public isStaff = false;
//   public isPending: boolean = true;
//
//   // ------------------------NEW STUFF-------------------- //
//   forLater: boolean;
//   forStaff: boolean;
//   user: User;
//   fromIcon: string = './assets/Search.png';
//   toIcon: string = './assets/Search.png';
//   from_title: string = 'From';
//   to_title: string = 'To';
//   _toProfile: ColorProfile;
//   _fromProfile: ColorProfile;
//   greenProfile: ColorProfile = new ColorProfile('green', 'green', '#00B476, #03CF31', '', '', '', '');
//   fromLocation: Location;
//   toLocation: Location;
//   formState: string = '';
//   requestTarget: User;
//   travelType: string = 'round_trip';
//   requestTime: Date = new Date();
//   duration: number = 5;
//   entryState: string;
//   toState: string = 'pinnables';
//   toCategory: string = '';
//   selectedStudents: User[] = [];
//   startTime = new Date();
//   requestMessage: string = '';
//   isDeclinable: boolean = true;
//   formStateHistory: string[] = [];
//   formHistoryIndex: number = 0;
//   isRedirected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
//   isNotDeny: boolean = true;
//   studentMessage: string;
//
//   declinable: FormControl;
//
//   public pinnables: Promise<Pinnable[]>;
//
//   constructor(
//     private http: HttpService,
//     private dataService: DataService,
//     public dialog: MatDialog,
//     @Inject(MAT_DIALOG_DATA) public dialogData: any,
//     public dialogRef: MatDialogRef<HallpassFormComponent>,
//   ) {
//     // this.declinable = new FormControl(true);
//     // this.declinable.valueChanges.subscribe(res => this.isDeclinable = res);
//     // this.pinnables = this.http.get<any[]>('v1/pinnables/arranged').toPromise().then(json => json.map(raw => Pinnable.fromJSON(raw)));
//   }
//
//   // get fromGradient() {
//   //   if (this.fromEnabled) {
//   //     if (this.fromLocation || (this.forLater && this.isDeclinable && this.isStaff)) {
//   //       return this.greenProfile.gradient_color;
//   //     } else {
//   //       return '#606981, #ACB4C1';
//   //     }
//   //   } else {
//   //     return '#CBD5E5, #CBD5E5';
//   //   }
//   // }
//   //
//   // get fromSolid() {
//   //   if (this.fromEnabled) {
//   //     if (this.fromLocation)
//   //       return '#00b476';
//   //     else
//   //       return '#6E7689';
//   //   } else {
//   //     return '#CBD5E5';
//   //   }
//   // }
//   //
//   // get toGradient() {
//   //   if (this.entryState) {
//   //     return this._toProfile.gradient_color;
//   //   }
//   //   if (this.toEnabled) {
//   //     if (this.toLocation) {
//   //       return this._toProfile.gradient_color;
//   //     } else {
//   //       return '#606981, #ACB4C1';
//   //     }
//   //   } else {
//   //     return '#CBD5E5, #CBD5E5';
//   //   }
//   // }
//   //
//   // get toSolid() {
//   //   if (this.toEnabled) {
//   //     if (this.toLocation) {
//   //       return this._toProfile.solid_color;
//   //     } else {
//   //       return '#7E879D';
//   //     }
//   //   } else {
//   //     return '#CBD5E5';
//   //   }
//   // }
//   //
//   // get toEnabled() {
//   //   if (this.fromLocation || (this.isDeclinable && this.forLater && this.forStaff)) {
//   //     return true;
//   //   } else {
//   //     return false;
//   //   }
//   // }
//   //
//   // get fromEnabled() {
//   //   return !(this.forLater && this.forStaff && this.isDeclinable);
//   // }
//   //
//   // get dividerText() {
//   //   if (this.formState === 'from') {
//   //     return 'From where?';
//   //   } else if (this.formState.substring(0, 2) === 'to') {
//   //     if (this.toCategory)
//   //       return this.toCategory;
//   //     else
//   //       return 'To where?';
//   //   } else if (this.formState === 'restrictedTarget') {
//   //     return 'Send Pass Request To?';
//   //   } else if (this.formState === 'restrictedMessage') {
//   //     return 'Message';
//   //   } else if (this.formState === 'datetime') {
//   //     return 'Select Date & Time';
//   //   } else if (this.formState === 'students') {
//   //     return 'Select student(s)';
//   //   }
//   // }
//   //
//   // get dividerIcon() {
//   //   if (this.formState === 'from' || this.formState.substring(0, 2) === 'to' || this.formState === 'students') {
//   //     if (this.toCategory && this.formState.substring(0, 2) === 'to')
//   //       return this.toIcon;
//   //     else
//   //       return './assets/Search (White).png';
//   //   } else if (this.formState === 'restrictedMessage') {
//   //     return './assets/Message (White).png';
//   //   } else if (this.formState === 'datetime') {
//   //     return './assets/Scheduled Pass (White).png';
//   //   } else if (this.formState === 'restrictedTarget') {
//   //     return './assets/Lock (White).png';
//   //   }
//   // }
//   //
//   // get dividerGradient() {
//   //   let colors = '#606981, #CBD5E5';
//   //   if (this.formState === 'datetime') {
//   //     colors = '#03CF31,#00B476';
//   //   } else if (this._toProfile && this.entryState !== 'from') {
//   //     colors = this._toProfile.gradient_color;
//   //   }
//   //   return 'radial-gradient(circle at 98% 97%,' + colors + ')';
//   // }
//
//   ngOnInit() {
//     // console.log('[Form Data]: ', this.dialogData);
//     // this.forLater = this.dialogData['forLater'];
//     // this.forStaff = this.dialogData['forStaff'];
//     // if (this.dialogData['selectedStudents']) {
//     //   this.fromLocation = this.dialogData['fromLocation'];
//     //   if (this.fromLocation) {
//     //     this.from_title = this.fromLocation.title;
//     //   }
//     //   this.formStateHistory = this.dialogData['fromHistory'];
//     //   this.formHistoryIndex = this.dialogData['fromHistoryIndex'];
//     //   this.selectedStudents = this.dialogData['selectedStudents'];
//     //   if (this.dialogData['toLocation']) {
//     //     this.toLocation = this.dialogData['toLocation'];
//     //     this._toProfile = this.dialogData['colorProfile'];
//     //     this.requestTarget = this.dialogData['requestTarget'];
//     //     this.toIcon = this.dialogData['toIcon'];
//     //     this.to_title = this.toLocation.title;
//     //   }
//     //
//     //   if (this.dialogData['toCategory']) {
//     //     this.toCategory = this.dialogData['toCategory'];
//     //     this.toIcon = this.dialogData['toIcon'];
//     //     this._toProfile = this.dialogData['toProfile'];
//     //   }
//     //   this.isRedirected.next(false);
//     //   this.setFormState(this.formStateHistory[this.formHistoryIndex]);
//     // }
//     // if (this.dialogData['requestTime']) {
//     //   this.requestTime = this.dialogData['requestTime'];
//     // }
//     // this.entryState = this.dialogData['entryState'];
//     // if (this.entryState) {
//     //   this.requestMessage = this.dialogData['originalMessage'];
//     //   if (this.dialogData['originalToLocation']) {
//     //     this.toLocation = this.dialogData['originalToLocation'];
//     //     this._toProfile = this.dialogData['colorProfile'];
//     //     this.to_title = this.toLocation.title;
//     //   }
//     //   if (this.dialogData['originalFromLocation']) {
//     //     this.fromLocation = this.dialogData['originalFromLocation'];
//     //     this._fromProfile = this.greenProfile;
//     //     this.from_title = this.fromLocation.title;
//     //   }
//     //   if (this.dialogData['isDeny']) {
//     //     this.isNotDeny = false;
//     //     this.studentMessage = this.dialogData['studentMessage'];
//     //   }
//     // }
//     // if (this.isRedirected.value) {
//     //   this.setFormState(this.entryState ? this.entryState : (this.forLater ? 'datetime' : (this.forStaff ? 'students' : 'from')));
//     // }
//     // // this.updateFormHeight();
//     //
//     // this.dataService.currentUser.subscribe(user => {
//     //   this.user = user;
//     // });
//     //
//     // this.dialogRef.updatePosition({top: '120px'});
//   }
//
//   // updateFormHeight() {
//   //   const matDialogConfig: MatDialogConfig = new MatDialogConfig();
//   //   matDialogConfig.height = this.formState === 'datetime' ? '516px' : '385px';
//   //   matDialogConfig.width = '750px';
//   //   this.dialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
//   // }
//   //
//   // back() {
//   //   this.toCategory = '';
//   //   let newIndex = this.formHistoryIndex - 1;
//   //   if (this.formStateHistory[newIndex] !== 'restrictedTarget') {
//   //     this._toProfile = null;
//   //     this.requestTarget = null;
//   //   }
//   //
//   //   if (newIndex === -1) {
//   //     this.dialogRef.close();
//   //     return false;
//   //   }
//   //   if (newIndex < 0) {
//   //     this.dialogRef.close({
//   //       'fromLocation': this.fromLocation,
//   //       'startTime': this.requestTime,
//   //       'message': this.requestMessage
//   //     });
//   //   } else {
//   //     if (this.formStateHistory[newIndex] === 'to-category') {
//   //       this.setFormState('to-pinnables', true);
//   //     } else {
//   //       this.setFormState(this.formStateHistory[newIndex], true);
//   //     }
//   //   }
//   //
//   //   if (this.formState === 'to-pinnables' || this.formState === 'to-category') {
//   //     this.toLocation = null;
//   //     this.to_title = 'To';
//   //   }
//   //
//   //   // console.log('[Form History]: \n-----==========-----', this.formStateHistory, this.formHistoryIndex);
//   // }
//
//   // setFormState(state, back?: boolean) {
//   //   // this.pinnables.then(val => console.log(val));
//     if (this.entryState && this.formState) {
//       console.log(this.entryState + ' && ' + this.formState);
//       this.dialogRef.close({
//         'fromLocation': this.fromLocation,
//         'startTime': this.requestTime,
//         'message': this.requestMessage
//       });
//       return;
//     }
//   //
//   //   if (!back) {
//   //     this.formState = state;
//   //       console.log('STATE ====>>>>', state);
//   //
//   //       if (!this.formStateHistory.find(s => s === state)) {
//   //       this.formStateHistory.push(this.formState);
//   //     }
//   //     this.formHistoryIndex = this.formStateHistory.length - 1;
//   //     // console.log('[Form History]: \n-----==========-----', this.formStateHistory, this.formHistoryIndex);
//   //   } else {
//   //     if (state === 'from') {
//   //       this.fromLocation = null;
//   //       this.from_title = 'From';
//   //     }
//   //     let index = this.formStateHistory.indexOf(this.formState);
//   //     if (index > -1) {
//   //       this.formStateHistory.splice(index, 1);
//   //     }
//   //
//   //     this.formState = state;
//   //     this.formHistoryIndex = this.formStateHistory.length - 1;
//   //   }
//   //
//   //   // this.updateFormHeight();
//   //
//   //   if (state === 'to') {
//   //     if (!!this.fromLocation) {
//   //       //this.pinnables = this.http.get<Pinnable[]>('v1/pinnables').toPromise();
//   //       this.setFormState('to-pinnables');
//   //     }
//   //   }
//   // }
//   //
//   // pinnableSelected(event: Pinnable) {
//   //   console.log(event);
//   //   if (event.type == 'location') {
//   //     this.to_title = event.title;
//   //     this.toIcon = event.icon || '';
//   //     this._toProfile = event.color_profile;
//   //     this.toLocation = event.location;
//   //     this.determinePass();
//   //   } else if (event.type == 'category') {
//   //     this.toCategory = event.category;
//   //     this.setFormState('to-category');
//   //     this.toIcon = event.icon || '';
//   //     this._toProfile = event.color_profile;
//   //   }
//   // }
//   //
//   // getCategoryListVisibility() {
//   //   if (this.formState == 'to-category') {
//   //     return 'block';
//   //   } else {
//   //     return 'none';
//   //   }
//   // }
//   //
//   // setColorProfile(type: string, color_profile: ColorProfile) {
//   //   if (type == 'to') {
//   //     this._toProfile = color_profile;
//   //   } else if (type == 'from') {
//   //     this._fromProfile = color_profile;
//   //   }
//   // }
//   //
//   // updateDuration(event: Duration) {
//   //   this.duration = event.value;
//   // }
//   //
//   // updateType(event: string) {
//   //   this.travelType = event;
//   //   // console.log(this.travelType);
//   // }
//   //
//   // locationChosen(event: Location, type: string) {
//   //   if (type === 'from') {
//   //     this.formState = 'from';
//   //     this.from_title = event.title;
//   //     this.fromLocation = event;
//   //     this.setFormState('to-pinnables');
//   //   } else if (type === 'to') {
//   //     this.to_title = event.title;
//   //     this.toLocation = event;
//   //     this.determinePass();
//   //   } else {
//   //     this.setFormState('to-pinnables');
//   //     this.to_title = event.title;
//   //     this.toLocation = event;
//   //   }
//   // }
//   //
//   // sendRequest(message: string) {
//   //   this.requestMessage = message;
//   //   this.determinePass();
//   // }
//   //
//   // updateTarget(event: any) {
//   //   this.requestTarget = event;
//   //   this.setFormState('restrictedMessage');
//   // }
//   //
//   determinePass() {
//     if (((this.toLocation.restricted && !this.forLater) || (this.toLocation.scheduling_restricted && this.forLater)) && !this.forStaff) {
//       if (this.requestTarget) {
//         let templateRequest: Request = new Request('template', null, this.fromLocation, this.toLocation, this.requestMessage, '', 'pending', null, '', this.toIcon, this.requestTarget, this.requestTime, '', null, null, this._toProfile, null, null, 60, null);
//         this.dialogRef.close({
//           'fromHistory': this.formStateHistory,
//           'fromHistoryIndex': this.formHistoryIndex,
//           'templatePass': templateRequest,
//           'forLater': this.forLater,
//           'selectedStudents': this.selectedStudents,
//           'restricted': true,
//           'type': 'request'
//         });
//       } else {
//         this.setFormState('restrictedTarget');
//       }
//     } else if (!((this.toLocation.restricted && !this.forLater) || (this.toLocation.scheduling_restricted && this.forLater)) && !this.forStaff) {
//       let templatePass: HallPass = new HallPass('template', this.user, null, null, null, this.requestTime, null, null, this.fromLocation, this.toLocation, '', '', this.toIcon, this._toProfile, null, '', '');
//       this.dialogRef.close({
//         'fromHistory': this.formStateHistory,
//         'fromHistoryIndex': this.formHistoryIndex,
//         'templatePass': templatePass,
//         'forLater': this.forLater,
//         'restricted': false,
//         'forStaff': this.forStaff,
//         'selectedStudents': this.selectedStudents,
//         'type': 'hallpass',
//       });
//     } else {
//       if (this.isDeclinable && this.forLater) {
//         console.log('New Invitations');
//         let templateInvitation: Invitation = new Invitation('template', null, null, this.toLocation, [this.requestTime], this.user, 'pending', this.duration, this._toProfile.gradient_color, this.toIcon, this.travelType, this._toProfile, null, null, null, null);
//         this.dialogRef.close({
//           'fromHistory': this.formStateHistory,
//           'fromHistoryIndex': this.formHistoryIndex,
//           'templatePass': templateInvitation,
//           'forLater': this.forLater,
//           'restricted': false,
//           'forStaff': this.forStaff,
//           'selectedStudents': this.selectedStudents,
//           'type': 'invitation'
//         });
//       } else {
//         let templatePass: HallPass = new HallPass('template', this.user, null, null, null, this.requestTime, null, null, this.fromLocation, this.toLocation, '', '', this.toIcon, this._toProfile, null, '', '');
//         this.dialogRef.close({
//           'fromHistory': this.formStateHistory,
//           'fromHistoryIndex': this.formHistoryIndex,
//           'templatePass': templatePass,
//           'forLater': this.forLater,
//           'restricted': false,
//           'forStaff': this.forStaff,
//           'selectedStudents': this.selectedStudents,
//           'type': 'hallpass',
//         });
//       }
//     }
//   }
//   //
//   // openPassCard(data) {
//   //   console.log('OPENNN ===>>>', data);
//   // }
//   //
//   // newRequest(message: string) {
//   //   let body = {
//   //     'destination': this.toLocation.id,
//   //     'origin': this.fromLocation.id,
//   //     'attachment_message': message,
//   //     'travel_type': this.travelType,
//   //     'teacher': this.toLocation.teachers[0].id
//   //   };
//   //
//   //   this.http.post('v1/pass_requests', body,).subscribe((data) => {
//   //     // console.log("Request POST Data: ", data);
//   //     this.dialogRef.close(Request.fromJSON(data));
//   //   });
//   // }
//   //
//   // newPass() {
//   //   const body = {
//   //     'student': this.user.id,
//   //     'duration': this.duration,
//   //     'origin': this.fromLocation.id,
//   //     'destination': this.toLocation.id,
//   //     'travel_type': this.travelType
//   //   };
//   //
//   //   this.http.post('v1/hall_passes', body,).subscribe((data) => {
//   //     // console.log("Request POST Data: ", data);
//   //     this.dialogRef.close(HallPass.fromJSON(data));
//   //   });
//   //
//   // }
//   //
//   // newInvitation() {
//   //
//   // }
//   //
//   // studentsUpdated(students) {
//   //   this.selectedStudents = students;
//   //   // console.log(this.selectedStudents);
//   // }
//   //
//   // dateToString(s: Date): string {
//   //   return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
//   // }
// }
