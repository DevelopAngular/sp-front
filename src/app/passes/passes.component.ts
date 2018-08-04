import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '../../../node_modules/@angular/material';
import { Router } from '../../../node_modules/@angular/router';
import { Observable } from '../../../node_modules/rxjs';
import { DataService } from '../data-service';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HttpService } from '../http-service';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { LoadingService } from '../loading.service';
import { BasicPassLikeProvider, PassLikeProvider } from '../models';
import { ColorProfile } from '../models/ColorProfile';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Location } from '../models/Location';
import { testInvitations, testPasses, testRequests } from '../models/mock_data';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { RequestCardComponent } from '../request-card/request-card.component';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

@Component({
  selector: 'app-passes',
  templateUrl: './passes.component.html',
  styleUrls: ['./passes.component.scss']
})
export class PassesComponent implements OnInit {

  testPasses: PassLikeProvider;
  testRequests: PassLikeProvider;
  testInvitations: PassLikeProvider;

  currentPass: HallPass;
  currentRequest: Request;
  futurePasses: HallPass[];

  user: User;
  isStaff = false;

  constructor(private http: HttpService, public dataService: DataService, private router: Router,
              public dialog: MatDialog, private _zone: NgZone, private loadingService: LoadingService) {

    this.testPasses = new BasicPassLikeProvider(testPasses);
    this.testRequests = new BasicPassLikeProvider(testRequests);
    this.testInvitations = new BasicPassLikeProvider(testInvitations);

<<<<<<< HEAD
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

    this.testInvitation1 = new Invitation('testInvitation1', this.testStudent, this.testOrigin,
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
=======
>>>>>>> ecd7f61e76610bd3e32e7b9daa368f7e0dd77da1
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
