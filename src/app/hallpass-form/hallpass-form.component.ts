import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatSlideToggleChange, MatStepper } from '@angular/material';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { Duration, HallPass, Invitation, Location, Pinnable, Request, User } from '../NewModels';

@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.css']
})
export class HallpassFormComponent implements OnInit {
  // General Set-Up
  public isLoggedIn: Boolean = false;
  public isStaff = false;
  public msgs: Message[] = [];
  public isPending: boolean = true;

  // ------------------------NEW STUFF-------------------- //
  user: User;
  show: boolean = false;
  passType: string = 'rt';
  fromIcon: string = './assets/Search.png';
  toIcon: string = './assets/Search.png';
  from_title: string = 'From';
  to_title: string = 'To';
  _toGradient: string = '';
  _fromGradient: string = '';
  greenGradient = '#00B476, #03CF31';
  // locationType: string = '';
  fromLocation: Location;
  toLocation: Location;
  formState: string = 'from';
  requestTarget:User;
  travelType: string = 'round_trip';
  duration: number = 5;
  sliderDuration: number = 5;
  toState: string = 'pinnables';
  toCategory: string = '';
  selectedStudents: User[] = [];
  isMandatory: boolean = false;
  startTime: Date = new Date();
  requestMessage: string = "";
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
              private router: Router, public dialog: MatDialog,
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
      this._fromGradient = this.greenGradient;
      // this.locationType = 'to';

      this.formState = (this.formState === 'fields') ? 'fields' : 'to';
    });

    this.secondFormGroup.controls['destinationCtrl'].valueChanges.subscribe(result => {
      this.toState = 'pinnables';
      this.to_title = result.title;
      // this.toIcon = "";
      // this.toGradient = this.greenGradient;
      // this.formState = 'fields';
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
      return this._fromGradient;
    } else{
      return "#7E879D, #7E879D";
    }
  }

  get toGradient(){
    if(this.toEnabled){
      if(this.toLocation){
        return this._toGradient;
      } else{
        return "#7E879D, #7E879D";
      }
    } else{
      return "#CBD5E5, #CBD5E5";
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
      this.toGradient,
      this.toIcon,
    );
  }

  ngOnInit() {
    this.dataService.currentUser.subscribe(user => {
      this.user = user;
      this.isStaff = this.user.roles.includes('edit_all_hallpass');

      this.originRequired = !this.isStaff;
    });

    this.dialogRef.updatePosition({top: '225px'});

    //console.log(this.user.roles);

    //console.log('Hallpass form is staff:' + this.isStaff);

  }

  setStartTime(event) {
    this.startTime = new Date(event);
  }

  setFormState(state) {
    this.formState = state;
    if (state === 'to') {
      if (!!this.fromLocation) {
        // this._toGradient = '"#7E879D, #7E879D"';
        // this.toIcon = './assets/Search.png';
        // this.to_title = 'To';

        this.pinnables = this.http.get<Pinnable[]>('api/methacton/v1/pinnables').toPromise();
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
        this._toGradient = event.gradient_color;
        return;
      } else {
        this.toIcon = event.icon || '';
        this._toGradient = event.gradient_color;

        this.secondFormGroup.controls['destinationCtrl'].setValue(event.location);
      }

    } else {

      // console.log("[Pinnable Selected]: ", event);
      if (event.type == 'location') {
        this.to_title = event.title;
        this.toIcon = event.icon || '';
        this._toGradient = event.gradient_color;
        this.toLocation = event.location;

        this.determinePass();

      } else if (event.type == 'category') {
        this.toCategory = event.category;
        this.toState = 'category';
        this.toIcon = event.icon || '';
        this._toGradient = event.gradient_color;
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
    }
  }

  get dividerIcon(){
    if(this.formState === 'from' || this.formState === 'to'){
      return './assets/Search.png';
    } else if(this.formState === 'restrictedMessage'){
      return './assets/Message.png';
    }
  }

  setGradient(type: string, gradient_color: string) {
    if (type == 'to') {
      this._toGradient = gradient_color;
    } else if (type == 'from') {
      this._fromGradient = gradient_color;
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
    // } else if(type === 'request'){
    //   this.requestTarget = event.teachers[0]; //TODO Update so that it picks from teachers and not locations
    //   this.formState = "restrictedMessage";
    } else if(type === 'to'){
      this.to_title = event.title;
      this.toLocation = event;
      this.determinePass();
    } else {
      this.toState = 'pinnables';
      this.to_title = event.title;
      // this.toIcon = "";
      // this.toGradient = this.greenGradient;
      this.toLocation = event;
    }
  }

  sendRequest(message:string){
    this.requestMessage = message;
    this.determinePass();
  }

  updateTarget(event:any){
    this.requestTarget = event;
    this.formState = 'restrictedMessage';
  }

  determinePass() {
    if(!this.toLocation.restricted){
      this.dialogRef.close({
          'fromLocation': this.fromLocation,
          'toLocation': this.toLocation,
          'restricted': this.toLocation.restricted,
          'icon': this.toIcon,
          'gradient': this.toGradient
          });
    } else{
      if(this.requestMessage === ''){
        this.formState = 'restrictedTarget';
      } else{
        this.dialogRef.close({
          'fromLocation': this.fromLocation,
          'toLocation': this.toLocation,
          'restricted': this.toLocation.restricted,
          'requestTarget' : this.requestTarget,
          'message' : this.requestMessage,
          'icon': this.toIcon,
          'gradient': this.toGradient
          });
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
    //return s.toISOString();
    return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
  }
}
