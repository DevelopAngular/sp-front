import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/api';
import { JSONSerializer, User } from '../models';
import { Duration, HallPass, Invitation, Location, Pinnable, Request } from '../NewModels';
import { MatDialog, MatDialogRef, MatSlideToggleChange } from '@angular/material';
import { LocationChooseComponent } from '../location-choose/location-choose.component';
import { DomSanitizer } from '@angular/platform-browser';

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
  greenGradient = '#03cf31,#018155';
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

  public pinnables: Promise<Pinnable[]>;

  constructor(private messageService: MessageService, private http: HttpService, private dataService: DataService, private router: Router, private serializer: JSONSerializer, public dialog: MatDialog, public dialogRef: MatDialogRef<HallpassFormComponent>, private sanitization: DomSanitizer) {
  }

  ngOnInit() {
    this.dataService.currentUser.subscribe(user => this.user = user);
    //console.log(this.user.roles);
    this.isStaff = this.user.roles.includes('edit_all_hallpass');
    //console.log('Hallpass form is staff:' + this.isStaff);

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

  pinnableSelected(event: Pinnable) {
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

  locationChosen(event: Location) {
    this.toState = 'pinnables';
    this.to_title = event.title;
    // this.toIcon = "";
    // this.toGradient = this.greenGradient;
    this.formState = 'fields';
    this.toLocation = event;
  }

  determinePass() {
    if (this.isStaff)
      this.teacherPass();
    else
      this.newPass();
  }

  teacherPass() {
    if (this.selectedStudents.length < 1) {
      this.msgs.push({severity: 'error', summary: 'Attention!', detail: 'Make sure you you select student(s).'});
    } else {
      if (this.isMandatory) {
        this.newPass();
      } else {
        this.newInvitation();
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

    this.http.post('api/methacton/v1/pass_requests', body, {headers: {'': ''}}).subscribe((data) => {
      // console.log("Request POST Data: ", data);
      this.dialogRef.close(Request.fromJSON(data));
    });
  }

  newPass() {
    if (!this.isStaff) {
      let body = {
        'student': this.user.id,
        'duration': this.duration,
        'origin': this.fromLocation.id,
        'destination': this.toLocation.id,
        'travel_type': this.travelType
      };

      this.http.post('api/methacton/v1/hall_passes', body, {headers: {'': ''}}).subscribe((data) => {
        // console.log("Request POST Data: ", data);
        this.dialogRef.close(HallPass.fromJSON(data));
      });
    } else {
      // console.log("[Staff Pass]: ", this.selectedStudents.length);
      if (this.selectedStudents.length > 1) {
        let students: string[] = [];
        for (let i = 0; i < this.selectedStudents.length; i++) {
          students.push(this.selectedStudents[i].id);
        }
        let body = {
          'students': students,
          'duration': this.duration,
          'origin': this.fromLocation.id,
          'destination': this.toLocation.id,
          'travel_type': this.travelType
        };

        this.http.post('api/methacton/v1/hall_passes/bulk_create', body, {headers: {'': ''}}).subscribe((data) => {
          // console.log("Request POST Data: ", data);
          this.dialogRef.close(HallPass.fromJSON(data[0]));
        });
      } else {
        let body = {
          'student': this.selectedStudents[0].id,
          'duration': this.duration,
          'origin': this.fromLocation.id,
          'destination': this.toLocation.id,
          'travel_type': this.travelType
        };

        this.http.post('api/methacton/v1/hall_passes', body, {headers: {'': ''}}).subscribe((data) => {
          // console.log("Request POST Data: ", data);
          this.dialogRef.close(HallPass.fromJSON(data));
        });
      }
    }
  }

  newInvitation() {
    if (this.selectedStudents.length > 1) {
      let students: string[] = [];
      for (let i = 0; i < this.selectedStudents.length; i++) {
        students.push(this.selectedStudents[i].id);
      }
      let body = {
        'students': students,
        'default_origin': null,
        'destination': this.toLocation.id,
        'date_choices': [new Date()],
        'duration': this.duration,
      };

      this.http.post('api/methacton/v1/invitations/bulk_create', body, {headers: {'': ''}}).subscribe((data) => {
        // console.log("Request POST Data: ", data);
        this.dialogRef.close(Invitation.fromJSON(data[0]));
      });
    } else {
      let body = {
        'student': this.selectedStudents[0].id,
        'default_origin': null,
        'destination': this.toLocation.id,
        'date_choices': [new Date()],
        'duration': this.duration,
      };

      this.http.post('api/methacton/v1/invitations', body, {headers: {'': ''}}).subscribe((data) => {
        // console.log("Request POST Data: ", data);
        this.dialogRef.close(Invitation.fromJSON(data));
      });
    }
  }

  studentsUpdated(students) {
    this.selectedStudents = students;
    // console.log(this.selectedStudents);
  }

  getUser() {
    return new Promise((resolve, reject) => {
      this.http.get('api/methacton/v1/users/@me').subscribe((data: any) => {
        this.user = this.serializer.getUserFromJSON(data);
        resolve(this.user);
      }, reject);
    });
  }

  dateToString(s: Date): string {
    //return s.toISOString();
    return s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
  }
}
