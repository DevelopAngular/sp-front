import { Component, NgZone, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { MatDialog } from '@angular/material';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HallPass, HallPassSummary, Invitation, Request, User } from '../NewModels';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import { LoadingService } from '../loading.service';
import { switchMap } from 'rxjs/operators';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  currentPass: HallPass;
  futurePasses: HallPass[];

  // -----------------------NEW STUFF--------------------- //
  checkedPasses = false;
  // invitations: Promise<Invitation[]>;
  requests: Promise<Request[]>;

  invitations = this.dataService.currentUser.pipe(
    switchMap(user => {
      const options = isUserStaff(user) ? {status: 'pending'} : {status: 'pending', student: user.id};

      return this.dataService.watchInvitations(options)
        .pipe(this.loadingService.watchFirst);
    }),
  );

  constructor(private http: HttpService, public dataService: DataService, private router: Router,
              public dialog: MatDialog, private _zone: NgZone, private loadingService: LoadingService) {
  }

  get isStaff$(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
  }


  ngOnInit() {
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {

          const isStaff = isUserStaff(user);
          if (!isStaff) {
            // this.invitations = this.http.get<Invitation[]>(`api/methacton/v1/invitations?status=pending&student=${user.id}`).toPromise();
            this.requests = this.http.get<Request[]>(`api/methacton/v1/pass_requests?status=pending&student=${user.id}`)
              .pipe(this.loadingService.watchFirst).toPromise();

            this.http.get<HallPassSummary>('api/methacton/v1/hall_passes/summary')
              .pipe(this.loadingService.watchFirst)
              .toPromise().then(data => {
              this._zone.run(() => {
                this.currentPass = (!!data['active_pass']) ? HallPass.fromJSON(data['active_pass']) : null;
                this.checkedPasses = true;
                if (data['future_passes']) {
                  this.futurePasses = data['future_passes'].map(raw => HallPass.fromJSON(raw));
                } else {
                  this.futurePasses = null;
                }
              });
            });
          } else {
            // this.invitations = this.http.get<Invitation[]>('api/methacton/v1/invitations?status=pending').toPromise();
            this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests?status=pending').toPromise();

            this.checkedPasses = true;
          }
        });
      });

  }

  showForm(): void {
    const dialogRef = this.dialog.open(HallpassFormComponent, {
      width: '750px'
    });

    dialogRef.afterClosed().subscribe((result: Object) => {
      this.isStaff$.subscribe(isStaff => {
        this._zone.run(() => {
          if (result instanceof HallPass) {
            this.currentPass = !isStaff ? result : null;
          } else if (result instanceof Request) {
            this.updateRequests();
          } else if (result instanceof Invitation) {
            if (isStaff) {
              this.updateInvites();
            }
          }
        });
      });
    });
  }

  endPass(hallpass: HallPass) {
    // console.log("Ending pass");
    this.http.post('api/methacton/v1/hall_passes/' + this.currentPass.id + '/ended', null, {'': ''}).subscribe((results) => {
    });
    this.currentPass = null;
  }

  updateInvites() {
    this.dataService.reloadInvitations();
  }

  updateRequests() {
    this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests?status=pending').toPromise();
  }

}
