import { Component, OnInit, NgZone } from '@angular/core';
import {User, Location, ColorProfile, HallPass, Invitation, Request} from '../NewModels';
import { HttpService } from '../http-service';
import { MatDialog } from '../../../node_modules/@angular/material';
import { DataService } from '../data-service';
import { Router } from '../../../node_modules/@angular/router';
import { LoadingService } from '../loading.service';
import { Observable } from '../../../node_modules/rxjs';
import { RequestCardComponent } from '../request-card/request-card.component';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
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
  testColorProfile = new ColorProfile('testColorProfile', 'Light-blue', '#0B9FC1,#00C0C7', '#07ABC3', '#11CFE5', '#0B9FC1', '#18EEF7')
  testDate:Date = new Date();

  testPass1: HallPass;
  testPass2: HallPass;
  testPass3: HallPass;
  testPass4: HallPass;
  testPasses: HallPass[] = [];

  testRequest1: Request;
  testRequest2: Request;
  testRequest3: Request;
  testRequest4: Request;
  testRequests: Request[] = [];

  testInvitation1: Invitation;
  testInvitation2: Invitation;
  testInvitation3: Invitation;
  testInvitation4: Invitation;
  testInvitations: Invitation[];

  currentPass: HallPass;
  currentRequest: Request;
  futurePasses: HallPass[];

  user: User;
  isStaff: boolean= false;
  
  constructor(private http: HttpService, public dataService: DataService, private router: Router,
              public dialog: MatDialog, private _zone: NgZone, private loadingService: LoadingService) {
    this.testDate.setMinutes(this.testDate.getMinutes()+1);

    this.testPass1 = new HallPass('testPass1', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), new Date(),
                                  this.testDate, this.testDate, this.testOrigin, 
                                  this.testDestination, 'round_trip', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
                                  
    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate()+4);
    this.testPass2 = new HallPass('testPass2', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), this.testDate,
                                  new Date(), new Date(), this.testOrigin, 
                                  this.testDestination, 'round_trip', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
                                  
    this.testDate = new Date();
    this.testDate.setDate(this.testDate.getDate()-1);
    this.testPass3 = new HallPass('testPass3', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), this.testDate,
                                  new Date(), new Date(), this.testOrigin, 
                                  this.testDestination, 'one_way', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);
    this.testDate = new Date();                              
    this.testDate.setDate(this.testDate.getDate()+1);
    this.testPass4 = new HallPass('testPass4', this.testStudent, this.testIssuer,
                                  new Date(), new Date(), this.testDate,
                                  new Date(), new Date(), this.testOrigin, 
                                  this.testDestination, 'one_way', '#1893E9,#05B5DE',
                                  'https://storage.googleapis.com/courier-static/icons/water-fountain.png', this.testColorProfile);

    this.testPasses = [this.testPass1, this.testPass2, this.testPass3, this.testPass4];

    this.testRequest1 = new Request('testRequest1', this.testStudent, this.testOrigin, this.testDestination,
                                    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.', 'round_trip', 'denied', null, '#00C0C7,#0B9FC1',
                                    'https://storage.googleapis.com/courier-static/icons/library.png',
                                    this.testIssuer, this.testDate, "I'm busy 6th period. Let's try 4th. And a whole bunch of stuff to test overflow. I wonder if it will work. And just a little bit more.",
                                    true, null, this.testColorProfile, new Date(), new Date(), 600);
    this.testRequest2 = new Request('testRequest2', this.testStudent, this.testOrigin, this.testDestination,
                                    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.', 'one_way', 'pending', null, '#00C0C7,#0B9FC1',
                                    'https://storage.googleapis.com/courier-static/icons/library.png',
                                    this.testIssuer, this.testDate, "I'm busy 6th period. Let's try 4th. And a whole bunch of stuff to test overflow. I wonder if it will work. And just a little bit more.",
                                    true, null, this.testColorProfile, new Date(), new Date(), 600);
    this.testRequest3 = new Request('testRequest3', this.testStudent, this.testOrigin, this.testDestination,
                                    'Could we meet to go over my math test 6th period? And a whole bunch of stuff to test overflow. I wonder if it will work.', 'round_trip', 'pending', null, '#00C0C7,#0B9FC1',
                                    'https://storage.googleapis.com/courier-static/icons/library.png',
                                    this.testIssuer, this.testDate, "I'm busy 6th period. Let's try 4th. And a whole bunch of stuff to test overflow. I wonder if it will work. And just a little bit more.",
                                    true, null, this.testColorProfile, new Date(), new Date(), 600);
    
    this.testRequests = [this.testRequest1, this.testRequest2, this.testRequest3];

    this.testInvitation1 = new Invitation('testInvitation1', this.testStudent, null,
                                          this.testDestination, [this.testDate], this.testIssuer,
                                          'status', 10, '#F37426,#F52B4F',
                                          'https://storage.googleapis.com/courier-static/icons/classroom.png', 'one_way',
                                          this.testColorProfile, new Date(), new Date(), new Date());
    this.testInvitation2 = new Invitation('testInvitation2', this.testStudent, this.testOrigin,
                                          this.testDestination, [this.testDate], this.testIssuer,
                                          'status', 10, '#F37426,#F52B4F',
                                          'https://storage.googleapis.com/courier-static/icons/classroom.png', 'one_way',
                                          this.testColorProfile, new Date(), null, new Date());
      
    this.testInvitations = [this.testInvitation1, this.testInvitation2];
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

  showForm(forLater:boolean): void {
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
                        (result['type']==='hallpass'?PassCardComponent:(result['type']==='request'?RequestCardComponent:InvitationCardComponent))
                      )
                    });
  }

  openInputCard(templatePass, forLater, forStaff, selectedStudents, component){
    this.dialog.open(component, {
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {'pass': templatePass, 
            'fromPast': false,
            'forFuture': forLater,
            'forInput': true,
            'forStaff': forStaff,
            'selectedStudents': selectedStudents
          }
    });
  }
}
