import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '../../../node_modules/@angular/material';
import { Router } from '../../../node_modules/@angular/router';
import { Observable } from '../../../node_modules/rxjs';
import { DataService } from '../data-service';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HttpService } from '../http-service';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { LoadingService } from '../loading.service';
import { ColorProfile } from '../models/ColorProfile';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Location } from '../models/Location';
import { User } from '../models/User';
import { Request} from '../models/Request';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { RequestCardComponent } from '../request-card/request-card.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

function constructTestPasses(student: User, issuer: User, origin: Location, destination: Location, colorProfile: ColorProfile) {
  let testDate = new Date();

  testDate.setMinutes(testDate.getMinutes() + 1);

  const testPass1 = new HallPass('testPass1', student, issuer,
    new Date(), new Date(), new Date(),
    testDate, testDate, origin,
    destination, 'round_trip', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);

  testDate = new Date();
  testDate.setDate(testDate.getDate() + 4);
  const testPass2 = new HallPass('testPass2', student, issuer,
    new Date(), new Date(), testDate,
    new Date(), new Date(), origin,
    destination, 'round_trip', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);

  testDate = new Date();
  testDate.setDate(testDate.getDate() - 1);
  const testPass3 = new HallPass('testPass3', student, issuer,
    new Date(), new Date(), testDate,
    new Date(), new Date(), origin,
    destination, 'one_way', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);
  testDate = new Date();
  testDate.setDate(testDate.getDate() + 1);
  const testPass4 = new HallPass('testPass4', student, issuer,
    new Date(), new Date(), testDate,
    new Date(), new Date(), origin,
    destination, 'one_way', '#1893E9,#05B5DE',
    'https://storage.googleapis.com/courier-static/icons/water-fountain.png', colorProfile);

  return [testPass1, testPass2, testPass3, testPass4];
}

function constructTestRequests(student: User, issuer: User, origin: Location, destination: Location, colorProfile: ColorProfile) {
  const testDate = new Date();

  const testRequest1 = new Request('testRequest1', student, origin, destination,
    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.', 'round_trip', 'denied', null, '#00C0C7,#0B9FC1',
    'https://storage.googleapis.com/courier-static/icons/library.png',
    issuer, testDate, 'I\'m busy 6th period. Let\'s try 4th. And a whole bunch of stuff to test overflow. I wonder if it will work. And just a little bit more.',
    true, null, colorProfile, new Date(), new Date(), 600);
  const testRequest2 = new Request('testRequest2', student, origin, destination,
    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.', 'one_way', 'pending', null, '#00C0C7,#0B9FC1',
    'https://storage.googleapis.com/courier-static/icons/library.png',
    issuer, testDate, 'I\'m busy 6th period. Let\'s try 4th. And a whole bunch of stuff to test overflow. I wonder if it will work. And just a little bit more.',
    true, null, colorProfile, new Date(), new Date(), 600);
  const testRequest3 = new Request('testRequest3', student, origin, destination,
    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.', 'round_trip', 'pending', null, '#00C0C7,#0B9FC1',
    'https://storage.googleapis.com/courier-static/icons/library.png',
    issuer, testDate, 'I\'m busy 6th period. Let\'s try 4th. And a whole bunch of stuff to test overflow. I wonder if it will work. And just a little bit more.',
    true, null, colorProfile, new Date(), new Date(), 600);

  return [testRequest1, testRequest2, testRequest3];
}

function constructTestInvitations(student: User, issuer: User, origin: Location, destination: Location, colorProfile: ColorProfile) {
  const testDate = new Date();


  const testInvitation1 = new Invitation('testInvitation1', student, null,
    destination, [testDate], issuer,
    'status', 10, '#F37426,#F52B4F',
    'https://storage.googleapis.com/courier-static/icons/classroom.png', 'one_way',
    colorProfile, new Date(), new Date(), new Date());
  const testInvitation2 = new Invitation('testInvitation2', student, origin,
    destination, [testDate], issuer,
    'status', 10, '#F37426,#F52B4F',
    'https://storage.googleapis.com/courier-static/icons/classroom.png', 'one_way',
    colorProfile, new Date(), null, new Date());

  return [testInvitation1, testInvitation2];
}

@Component({
  selector: 'app-passes',
  templateUrl: './passes.component.html',
  styleUrls: ['./passes.component.scss']
})
export class PassesComponent implements OnInit {

  testStudent = new User('testStudent', new Date(), new Date(), 'Kyle', 'Cook', 'Kyle Cook', 'mail@mail.com', []);
  testIssuer = new User('testIssuer', new Date(), new Date(), 'Donald', 'Sawyer', 'Don Sawyer', 'mail@mail.com', []);
  testOrigin = new Location('testOrigin', 'Ladson', 'MHS', 'C123', 'classroom', false, [], [], [], 15, false);
  testDestination = new Location('testDestination', 'Water Fountain', 'MHS', 'WF', '', false, [], ['round_trip', 'one_way'], [], 15, false);
  testColorProfile = new ColorProfile('testColorProfile', 'Light-blue', '#0B9FC1,#00C0C7', '#07ABC3', '#11CFE5', '#0B9FC1', '#18EEF7');

  testPasses: HallPass[];

  testRequests: Request[];

  testInvitations: Invitation[];

  currentPass: HallPass;
  currentRequest: Request;
  futurePasses: HallPass[];

  user: User;
  isStaff: boolean = false;

  constructor(private http: HttpService, public dataService: DataService, private router: Router,
              public dialog: MatDialog, private _zone: NgZone, private loadingService: LoadingService) {

    this.testPasses = constructTestPasses(this.testStudent, this.testIssuer, this.testOrigin, this.testDestination, this.testColorProfile);
    this.testRequests = constructTestRequests(this.testStudent, this.testIssuer, this.testOrigin, this.testDestination, this.testColorProfile);
    this.testInvitations = constructTestInvitations(this.testStudent, this.testIssuer, this.testOrigin, this.testDestination, this.testColorProfile);
    
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
  }

  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
        });
      });
  }

  showForm(forLater: boolean): void {
    const dialogRef = this.dialog.open(HallpassFormComponent, {
      width: '750px',
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {'forLater': forLater, 'forStaff': this.isStaff}
    });

    dialogRef.afterClosed().subscribe((result: Object) => {
      this.openInputCard(result['templatePass'],
        result['forLater'],
        result['forStaff'],
        result['selectedStudents'],
        (result['type'] === 'hallpass' ? PassCardComponent : (result['type'] === 'request' ? RequestCardComponent : InvitationCardComponent))
      );
    });
  }

  openInputCard(templatePass, forLater, forStaff, selectedStudents, component) {
    this.dialog.open(component, {
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {
        'pass': templatePass,
        'fromPast': false,
        'forFuture': forLater,
        'forInput': true,
        'forStaff': forStaff,
        'selectedStudents': selectedStudents
      }
    });
  }
}
