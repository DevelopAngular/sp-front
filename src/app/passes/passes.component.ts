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

  testPasses: HallPass[];
  testRequests: Request[];
  testInvitations: Invitation[];

  currentPass: HallPass;
  currentRequest: Request;
  futurePasses: HallPass[];

  user: User;
  isStaff = false;

  constructor(private http: HttpService, public dataService: DataService, private router: Router,
              public dialog: MatDialog, private _zone: NgZone, private loadingService: LoadingService) {

    this.testPasses = testPasses;
    this.testRequests = testRequests;
    this.testInvitations = testInvitations;

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
