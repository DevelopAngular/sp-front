import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/api';
import { Duration, HallPass, Invitation, Location, Pinnable, Request, User } from '../NewModels';
import { MatDialog, MatDialogRef, MatSlideToggleChange, MatStepper } from '@angular/material';
import { LocationChooseComponent } from '../location-choose/location-choose.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocationPickerComponent } from '../location-picker/location-picker.component';

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
  toGradient: string = 'rgb(151, 151, 151), rgb(80, 80, 80)';
  fromGradient: string = 'rgb(151, 151, 151), rgb(80, 80, 80)';
  greenGradient = '#03cf31, #018155';
  locationType: string = '';
  fromLocation: Location;
  toLocation: Location;
  formState: string = 'from';
  travelType: string = 'round_trip';
  duration: number = 5;
  sliderDuration: number = 5;
  toState: string = 'pinnables';
  toCategory: string = '';
  selectedStudents: User[] = [];
  isMandatory: boolean = false;
  startTime:Date = new Date();

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
      this.fromGradient = this.greenGradient;
      this.locationType = 'to';

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
      }else {
        this.firstFormGroup.controls['originCtrl'].clearValidators();
      }
      this.firstFormGroup.controls['originCtrl'].updateValueAndValidity({onlySelf: true, emitEvent: false});
      this.originRequired = this.isMandatory;
    });

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
    //console.log(this.user.roles);

    //console.log('Hallpass form is staff:' + this.isStaff);

  }

  setStartTime(event){
    this.startTime = new Date(event);
  }

  chooseLoc(loc) {
    this.locationType = loc;
    if (loc === 'to') {
      if (!!this.fromLocation) {
        this.toGradient = 'rgb(151, 151, 151), rgb(80, 80, 80)';
        this.toIcon = './assets/Search.png';
        this.to_title = 'To';

        this.pinnables = this.http.get<Pinnable[]>('api/methacton/v1/pinnables').toPromise();
        this.formState = 'to';
        this.toState = 'pinnables';
      } else {
        this.msgs.push({severity: 'error', summary: 'Attention!', detail: 'You must select a from location first.'});
      }
    } else if (loc === 'from') {
      let dialogRef = this.dialog.open(LocationChooseComponent, {
        width: '250px',
        hasBackdrop: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          return;
        }
        // console.log('The dialog was closed');
        this.fromLocation = result;
        this.from_title = this.fromLocation.title;
        this.fromIcon = '';
        this.fromGradient = this.greenGradient;
        this.locationType = 'to';

        this.formState = (this.formState == 'fields') ? 'fields' : 'to';
        this.pinnables = this.http.get<Pinnable[]>('api/methacton/v1/pinnables').toPromise();
      });
    }
  }

  pinnableSelected(event: Pinnable, picker?: LocationPickerComponent) {
    if (this.isStaff) {

      if (event.type === 'category') {
        picker.open();
        this.toIcon = event.icon || '';
        this.toGradient = event.gradient_color;
        return;
      } else {
        this.toIcon = event.icon || '';
        this.toGradient = event.gradient_color;

        this.secondFormGroup.controls['destinationCtrl'].setValue(event.location);
      }

    } else {

      // console.log("[Pinnable Selected]: ", event);
      if (event.type == 'location') {
        if (this.locationType == 'to') {
          this.to_title = event.title;
          this.toIcon = event.icon || '';
          this.toGradient = event.gradient_color;
          this.formState = 'fields';
          this.toLocation = event.location;
        }
      } else if (event.type == 'category') {
        this.toCategory = event.category;
        this.toState = 'category';
        this.toIcon = event.icon || '';
        this.toGradient = event.gradient_color;
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

  setGradient(type: string, gradient_color: string) {
    if (type == 'to') {
      this.toGradient = gradient_color;
    } else if (type == 'from') {
      this.fromGradient = gradient_color;
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

  getStepperBorderStyle(type:string, step:number){
    let color = '';
    if(type == 'back'){
      return 'solid 2px #0F0';
    } else{
      if(step == 1){
        return 'solid 2px #' +(this.firstFormGroup.valid?'0F0':'F00');
      } else if(step == 2){
        return 'solid 2px #' +(this.secondFormGroup.valid?'0F0':'F00');
      }
    }
    
  }

  locationChosen(event: Location) {
    this.toState = 'pinnables';
    this.to_title = event.title;
    // this.toIcon = "";
    // this.toGradient = this.greenGradient;
    this.formState = 'fields';
    this.toLocation = event;
  }

  determinePass() {
    if (this.isStaff) {
      this.teacherPass();
    } else {
      this.newPass();
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

    this.http.post('api/methacton/v1/pass_requests', body, ).subscribe((data) => {
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

    this.http.post('api/methacton/v1/hall_passes/bulk_create', body, ).subscribe((data) => {
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

    this.http.post('api/methacton/v1/hall_passes', body, ).subscribe((data) => {
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