import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatSlideToggleChange, MatStepper, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { Duration, HallPass, Invitation, Location, Pinnable, Request, User, ColorProfile } from '../NewModels';
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
  user: User;
  show: boolean = false;
  passType: string = 'rt';
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
  sliderDuration: number = 5;
  entryState: string;
  toState: string = 'pinnables';
  toCategory: string = '';
  selectedStudents: User[] = [];
  isMandatory: boolean = false;
  startTime: Date = new Date();
  requestMessage: string = '';
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  originCtrl = new FormControl();
  originRequired = true;

  durations: Duration[] = [
    new Duration('5 minutes', 300),
    new Duration('10 minutes', 600),
    new Duration('15 minutes', 900),
    new Duration('30 minutes', 1800)
  ];

  @ViewChild('stepper') stepper: MatStepper;

  public pinnables: Promise<Pinnable[]>;

  constructor(private messageService: MessageService, private http: HttpService, private dataService: DataService,
              private router: Router, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public dialogData: any,
              public dialogRef: MatDialogRef<HallpassFormComponent>, private _formBuilder: FormBuilder) {

    this.pinnables = this.http.get<any[]>('api/methacton/v1/pinnables').toPromise().then(json => json.map(raw => Pinnable.fromJSON(raw)));

    this.firstFormGroup = this._formBuilder.group({
      travelTypeCtrl: ['round_trip', Validators.required],
      studentsCtrl: ['', Validators.required],
      originCtrl: [''],
      durationCtrl: ['', Validators.required],
      mandatoryCtrl: [],
    });

    this.secondFormGroup = this._formBuilder.group({
      destinationCtrl: ['', Validators.required],
    });

    this.firstFormGroup.controls['originCtrl'].valueChanges.subscribe(result => {
      if (!result) {
        return;
      }
      // console.log('The dialog was closed');
      this.fromLocation = result;
      this.from_title = this.fromLocation.title;
      this.fromIcon = '';
      this._fromProfile = this.greenProfile;

      this.formState = (this.formState === 'fields') ? 'fields' : 'to';
    });

    this.secondFormGroup.controls['destinationCtrl'].valueChanges.subscribe(result => {
      this.toState = 'pinnables';
      this.to_title = result.title;
      this.toLocation = result;

      if (this.stepper) {
        setTimeout(() => {
          this.stepper.next();
        }, 5);
      }
    });

    this.firstFormGroup.controls['mandatoryCtrl'].valueChanges.subscribe(result => {
      this.isMandatory = result;
      if (this.isMandatory) {
        this.firstFormGroup.controls['originCtrl'].setValidators(Validators.required);
      } else {
        this.firstFormGroup.controls['originCtrl'].clearValidators();
      }
      this.firstFormGroup.controls['originCtrl'].updateValueAndValidity({onlySelf: true, emitEvent: false});
      this.originRequired = this.isMandatory;
    });

  }

  get fromGradient(){
    if(this.fromLocation){
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
        return "#7E879D, #7E879D";
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
    if(this.fromLocation){
      return true;
    } else{
      return false;
    }
  }

  get syntheticPass(): HallPass {
    if (!this.firstFormGroup.valid || !this.secondFormGroup.valid) {
      return null;
    }

    const start = this.startTime;

    const endTime = new Date(+start + (this.firstFormGroup.controls['durationCtrl'].value.value * 1000));

    return new HallPass(
      '1',
      this.firstFormGroup.controls['studentsCtrl'].value[0],
      this.user,
      new Date(),
      new Date(),
      start,
      endTime,
      endTime,
      this.firstFormGroup.controls['originCtrl'].value,
      this.secondFormGroup.controls['destinationCtrl'].value,
      this.firstFormGroup.controls['travelTypeCtrl'].value,
      null, //this.toGradient,
      this.toIcon,
      null
    );
  }

  ngOnInit() {
    console.log('[Form Data]: ', this.dialogData);
    this.forLater = this.dialogData['forLater'];

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

    this.formState = (this.entryState?this.entryState:(this.forLater?'datetime':'from'));

    this.updateFormHeight();

    this.dataService.currentUser.subscribe(user => {
      this.user = user;
      this.isStaff = this.user.roles.includes('edit_all_hallpass');
      this.originRequired = !this.isStaff;
    });

    this.dialogRef.updatePosition({top: '225px'});

    //console.log(this.user.roles);

    //console.log('Hallpass form is staff:' + this.isStaff);

  }

  updateFormHeight(){
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    matDialogConfig.height = this.formState==='datetime'?'562px':'385px';
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

  pinnableSelected(event: Pinnable, picker?: LocationPickerComponent) {
    if (this.isStaff) {

      if (event.type === 'category') {
        picker.open();
        this.toIcon = event.icon || '';
        this._toProfile = event.color_profile;
        return;
      } else {
        this.toIcon = event.icon || '';
        this._toProfile = event.color_profile;

        this.secondFormGroup.controls['destinationCtrl'].setValue(event.location);
      }

    } else {
      // console.log("[Pinnable Selected]: ", event);
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
  }

  getCategoryListVisibility() {
    if (this.toState == 'category') {
      return 'block';
    } else {
      return 'none';
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
    }
  }

  get dividerIcon(){
    if(this.formState === 'from' || this.formState === 'to'){
      return './assets/Search.png';
    } else if(this.formState === 'restrictedMessage'){
      return './assets/Message.png';
    } else if(this.formState === 'datetime'){
      return './assets/Later.png'
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

  updatePassType(event: MatSlideToggleChange) {
    this.isMandatory = event.checked;
    // console.log("[Is Mandatory]: ", this.isMandatory);
  }

  getStepperBorderStyle(type: string, step: number) {
    let color = '';
    if (type == 'back') {
      return 'solid 2px #0F0';
    } else {
      if (step == 1) {
        return 'solid 2px #' + (this.firstFormGroup.valid ? '0F0' : 'F00');
      } else if (step == 2) {
        return 'solid 2px #' + (this.secondFormGroup.valid ? '0F0' : 'F00');
      }
    }
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
    if(!this.toLocation.restricted){
      let templatePass:HallPass = new HallPass('template', this.user, null, null, null, this.requestTime, null, null, this.fromLocation, this.toLocation, '', '', this.toIcon, this._toProfile)
      this.dialogRef.close({
          'templatePass': templatePass,
          'forLater': this.forLater,
          'restricted': false
          });
    } else{
      if(this.requestTarget){
        let templateRequest:Request = new Request('template', null, this.fromLocation, this.toLocation, this.requestMessage, '', 'pending', null, '', this.toIcon, this.requestTarget, this.requestTime, '', null, null, this._toProfile, null, null, 60)
        this.dialogRef.close({
          'templatePass': templateRequest,
          'forLater': this.forLater,
          'restricted': true
          });
      } else{
        this.formState = 'restrictedTarget';
      }
    }
  }

  teacherPass() {
    if (this.isMandatory) {
      this.newStaffPass();
    } else {
      this.newInvitation();
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

  newStaffPass() {
    if (!this.firstFormGroup.valid || !this.secondFormGroup.valid) {
      return;
    }

    const students: User[] = this.firstFormGroup.controls['studentsCtrl'].value;
    const duration: number = this.firstFormGroup.controls['durationCtrl'].value.value;
    const origin: Location = this.firstFormGroup.controls['originCtrl'].value;
    const destination: Location = this.secondFormGroup.controls['destinationCtrl'].value;
    const travelType: string = this.firstFormGroup.controls['travelTypeCtrl'].value;

    const body = {
      'students': students.map(user => user.id),
      'duration': duration,
      'origin': origin.id,
      'destination': destination.id,
      'travel_type': travelType,
    };

    this.http.post('api/methacton/v1/hall_passes/bulk_create', body,).subscribe((data) => {
      // console.log("Request POST Data: ", data);
      this.dialogRef.close(HallPass.fromJSON(data[0]));
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
    if (!this.firstFormGroup.valid || !this.secondFormGroup.valid) {
      return;
    }

    const students: User[] = this.firstFormGroup.controls['studentsCtrl'].value;
    const duration: number = this.firstFormGroup.controls['durationCtrl'].value.value;
    const destination: Location = this.secondFormGroup.controls['destinationCtrl'].value;
    const travelType: string = this.firstFormGroup.controls['travelTypeCtrl'].value;

    const body = {
      'students': students.map(user => user.id),
      'default_origin': null,
      'destination': destination.id,
      'date_choices': [new Date().toISOString()],
      'duration': duration,
      'travel_type': travelType
    };

    this.http.post('api/methacton/v1/invitations/bulk_create', body).subscribe((data) => {
      // console.log("Request POST Data: ", data);
      this.dialogRef.close(Invitation.fromJSON(data[0]));
    });

  }

  studentsUpdated(students) {
    this.selectedStudents = students;
    // console.log(this.selectedStudents);
  }

  dateToString(s: Date): string {
    return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
  }
}
