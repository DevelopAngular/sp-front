import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatSlideToggleChange, MatStepper, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { ColorProfile } from '../models/ColorProfile';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Location } from '../models/Location';
import { Pinnable } from '../models/Pinnable';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { Duration} from '../models/Duration';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.scss']
})
export class HallpassFormComponent implements OnInit {
  // General Set-Up
  public isLoggedIn: Boolean = false;
  public isStaff = false;
  public msgs: Message[] = [];
  public isPending: boolean = true;

  // ------------------------NEW STUFF-------------------- //
  forLater: boolean;
  forStaff: boolean;
  user: User;
  fromIcon: string = './assets/Search.png';
  toIcon: string = './assets/Search.png';
  from_title: string = 'From';
  to_title: string = 'To';
  _toProfile: ColorProfile;
  _fromProfile: ColorProfile;
  greenProfile: ColorProfile = new ColorProfile('green', 'green', '#00B476, #03CF31', '', '', '', '');
  fromLocation: Location;
  toLocation: Location;
  formState: string = 'from';
  requestTarget:User;
  travelType: string = 'round_trip';
  requestTime: Date = new Date();
  duration: number = 5;
  entryState: string;
  toState: string = 'pinnables';
  toCategory: string = '';
  selectedStudents: User[] = [];
  startTime: Date = new Date();
  requestMessage: string = '';
  isDeclinable: boolean = true;

  public pinnables: Promise<Pinnable[]>;

  constructor(private http: HttpService, private dataService: DataService, public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public dialogData: any, public dialogRef: MatDialogRef<HallpassFormComponent>) {

    this.pinnables = this.http.get<any[]>('api/methacton/v1/pinnables').toPromise().then(json => json.map(raw => Pinnable.fromJSON(raw)));
  }

  get fromGradient(){
    if(this.fromLocation || (this.forLater && this.isDeclinable && this.isStaff)){
      return this.greenProfile.gradient_color;
    } else{
      return "#606981, #ACB4C1";
    }
  }

  get fromSolid(){
    if(this.fromLocation)
      return '#00b476';
    else
      return '#6E7689';
  }

  get toGradient(){
    if(this.entryState){
      return this._toProfile.gradient_color;
    }
    if(this.toEnabled){
      if(this.toLocation){
        return this._toProfile.gradient_color;
      } else{
        return "#606981, #ACB4C1";
      }
    } else{
      return "#CBD5E5, #CBD5E5";
    }
  }

  get toSolid(){
    if(this.toEnabled){
      if(this.toLocation){
        return this._toProfile.solid_color;
      } else{
        return '#7E879D';
      }
    } else{
        return '#CBD5E5';
    }
  }

  get toEnabled(){
    if(this.fromLocation || (this.isDeclinable && this.forLater && this.isStaff)){
      return true;
    } else{
      return false;
    }
  }

  get dividerText() {
    if (this.formState === 'from') {
      return 'From where?';
    } else if (this.formState === 'to') {
      return 'To where?';
    } else if(this.formState === 'restrictedTarget'){
      return 'Send Pass Request To?';
    } else if(this.formState === 'restrictedMessage'){
      return 'Message';
    } else if(this.formState === 'datetime'){
      return 'Select Date & Time';
    } else if(this.formState === 'students'){
      return 'Select student(s)';
    }
  }

  get dividerIcon(){
    if(this.formState === 'from' || this.formState === 'to' || this.formState === 'students'){
      return './assets/Search (White).png';
    } else if(this.formState === 'restrictedMessage'){
      return './assets/Message (White).png';
    } else if(this.formState === 'datetime'){
      return './assets/Scheduled Pass (White).png'
    }
  }

  get dividerGradient(){
    let colors = '#606981, #CBD5E5'
    if(this.formState==='datetime'){
      colors = '#03CF31,#00B476';
    } else if(this._toProfile){
      colors = this._toProfile.gradient_color;
    }
    return 'radial-gradient(circle at 98% 97%,' +colors +')';
  }

  ngOnInit() {
    console.log('[Form Data]: ', this.dialogData);
    this.forLater = this.dialogData['forLater'];
    this.forStaff = this.dialogData['forStaff'];

    this.entryState = this.dialogData['entryState'];
    if(this.entryState){
      this.requestMessage = this.dialogData['originalMessage'];
      if(this.dialogData['originalToLocation']){
        this.toLocation = this.dialogData['originalToLocation'];
        this._toProfile = this.dialogData['colorProfile'];
        this.to_title = this.toLocation.title;
      }
      if(this.dialogData['originalFromLocation']){
        this.fromLocation = this.dialogData['originalFromLocation'];
        this._fromProfile = this.greenProfile;
        this.from_title = this.fromLocation.title;
      }
    }

    this.formState = (this.entryState?this.entryState:(this.forLater?'datetime':(this.forStaff?'students':'from')));

    this.updateFormHeight();

    this.dataService.currentUser.subscribe(user => {
      this.user = user;
    });

    this.dialogRef.updatePosition({top: '225px'});
  }

  updateFormHeight(){
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    matDialogConfig.height = this.formState==='datetime'?(this.forStaff?'516px':'562px'):'385px';
    matDialogConfig.width = '750px';
    this.dialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
  }

  setStartTime(event) {
    this.startTime = new Date(event);
  }

  setFormState(state) {
    if(this.entryState){
      this.dialogRef.close({
          'fromLocation': this.fromLocation,
          'startTime': this.requestTime,
          'message': this.requestMessage
        });
        return;
    }
    this.formState = state;

    this.updateFormHeight();

    if (state === 'to') {
      if (!!this.fromLocation) {
        //this.pinnables = this.http.get<Pinnable[]>('api/methacton/v1/pinnables').toPromise();
        this.formState = 'to';
        this.toState = 'pinnables';
      }
    }
  }

  pinnableSelected(event: Pinnable) {
    if (event.type == 'location') {
      this.to_title = event.title;
      this.toIcon = event.icon || '';
      this._toProfile = event.color_profile;
      this.toLocation = event.location;
      this.determinePass();
    } else if (event.type == 'category') {
      this.toCategory = event.category;
      this.toState = 'category';
      this.toIcon = event.icon || '';
      this._toProfile = event.color_profile;
    }
  }

  getCategoryListVisibility() {
    if (this.toState == 'category') {
      return 'block';
    } else {
      return 'none';
    }
  }

  setColorProfile(type: string, color_profile: ColorProfile) {
    if (type == 'to') {
      this._toProfile = color_profile;
    } else if (type == 'from') {
      this._fromProfile = color_profile;
    }
  }

  updateDuration(event: Duration) {
    this.duration = event.value;
  }

  updateType(event: string) {
    this.travelType = event;
    // console.log(this.travelType);
  }

  locationChosen(event: Location, type: string) {
    if (type === 'from') {
      this.formState = 'from';
      this.from_title = event.title;
      this.fromLocation = event;
      this.setFormState('to');
    } else if(type === 'to'){
      this.to_title = event.title;
      this.toLocation = event;
      this.determinePass();
    } else {
      this.toState = 'pinnables';
      this.to_title = event.title;
      this.toLocation = event;
    }
  }

  sendRequest(message:string){
    this.requestMessage = message;
    this.setFormState('');
    this.determinePass();
  }

  updateTarget(event:any){
    this.requestTarget = event;
    this.formState = 'restrictedMessage';
  }

  determinePass() {
    if(this.toLocation.restricted && !this.forStaff){
      if(this.requestTarget){
        let templateRequest:Request = new Request('template', null, this.fromLocation, this.toLocation, this.requestMessage, '', 'pending', null, '', this.toIcon, this.requestTarget, this.requestTime, '', null, null, this._toProfile, null, null, 60, null)
        this.dialogRef.close({
          'templatePass': templateRequest,
          'forLater': this.forLater,
          'restricted': true,
          'type': 'request'
          });
      } else{
        this.formState = 'restrictedTarget';
      }
    } else if(!this.toLocation.restricted && !this.forStaff){
      let templatePass:HallPass = new HallPass('template', this.user, null, null, null, this.requestTime, null, null, this.fromLocation, this.toLocation, '', '', this.toIcon, this._toProfile, null, '', '')
        this.dialogRef.close({
            'templatePass': templatePass,
            'forLater': this.forLater,
            'restricted': false,
            'forStaff': this.forStaff,
            'selectedStudents': this.selectedStudents,
            'type': 'hallpass'
        });
    }else{
      if(this.isDeclinable && this.forLater){
        let templateInvitation: Invitation = new Invitation('template', null, null, this.toLocation, [this.requestTime], this.user, 'pending', this.duration, this._toProfile.gradient_color, this.toIcon, this.travelType, this._toProfile, null, null, null, null);
        this.dialogRef.close({
          'templatePass': templateInvitation,
          'forLater': this.forLater,
          'restricted': false,
          'forStaff': this.forStaff,
          'selectedStudents': this.selectedStudents,
          'type': 'invitation'
        });
      } else{
        let templatePass:HallPass = new HallPass('template', this.user, null, null, null, this.requestTime, null, null, this.fromLocation, this.toLocation, '', '', this.toIcon, this._toProfile, null, '', '')
        this.dialogRef.close({
            'templatePass': templatePass,
            'forLater': this.forLater,
            'restricted': false,
            'forStaff': this.forStaff,
            'selectedStudents': this.selectedStudents,
            'type': 'hallpass'
        });
      }
    }
  }

  newRequest(message: string) {
    let body = {
      'destination': this.toLocation.id,
      'origin': this.fromLocation.id,
      'attachment_message': message,
      'travel_type': this.travelType,
      'teacher': this.toLocation.teachers[0].id
    };

    this.http.post('api/methacton/v1/pass_requests', body,).subscribe((data) => {
      // console.log("Request POST Data: ", data);
      this.dialogRef.close(Request.fromJSON(data));
    });
  }

  newPass() {
    const body = {
      'student': this.user.id,
      'duration': this.duration,
      'origin': this.fromLocation.id,
      'destination': this.toLocation.id,
      'travel_type': this.travelType
    };

    this.http.post('api/methacton/v1/hall_passes', body,).subscribe((data) => {
      // console.log("Request POST Data: ", data);
      this.dialogRef.close(HallPass.fromJSON(data));
    });

  }

  newInvitation() {

  }

  studentsUpdated(students) {
    this.selectedStudents = students;
    // console.log(this.selectedStudents);
  }

  dateToString(s: Date): string {
    return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
  }
}
