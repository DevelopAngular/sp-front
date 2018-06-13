import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from '@angular/material';
import { Router } from '@angular/router';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../data-service';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HttpService } from '../http-service';
import { LoadingService } from '../loading.service';
import { HallPass, HallPassSummary, Invitation, Request, User } from '../NewModels';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  currentPass: HallPass | Request;
  futurePasses: HallPass[];

  // -----------------------NEW STUFF--------------------- //
  checkedPasses = false;
  // invitations: Promise<Invitation[]>;
  requests: Promise<Request[]>;
  user: User;
  tabIndex: number = 1;
  showDetails: boolean = false;

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
        this.user = user;
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
      width: '750px',
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop'
    });

    dialogRef.afterClosed().subscribe((result: Object) => {
      console.log('[Form Return]: ', result);
      this.showDetails = true;
      if(result['restricted']){
        this.currentPass = new Request('template', this.user, result['fromLocation'],
                                      result['toLocation'], result['message'],
                                      '', '', null, result['gradient'],
                                      result['icon'], result['requestTarget']);
      } else{
        this.currentPass = new HallPass('template', this.user, this.user,
                                        new Date(), new Date(), new Date(),
                                        new Date(), new Date(), result['fromLocation'],
                                        result['toLocation'], '', result['gradient'],
                                        result['icon']);
      }
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

  updateTab(tabIndex) {
    this.tabIndex = tabIndex;
  }

  cardEvent(event) {
    if(event.pass.id === 'template'){
      if (event.type == 'hallpass') {
        const body = {
          'student' : event.pass.student.id,
          'duration' : event.data.duration * 60,
          'origin' : event.pass.origin.id,
          'destination' : event.pass.destination.id,
          'travel_type' : event.pass.travel_type
        };
        this.http.post<HallPass>('api/methacton/v1/hall_passes', body).subscribe((data)=>{
          console.log('[New Pass]: ', data);
          this.currentPass = HallPass.fromJSON(data);
          this.showDetails = false;
        });
      } else if (event.type == 'request') {
        const body = {
          'origin' : event.pass.origin.id,
          'destination' : event.pass.destination.id,
          'attachment_message' : event.pass.attachment_message,
          'travel_type' : event.pass.travel_type,
          'teacher' : event.pass.teacher.id
        };
        this.http.post<HallPass>('api/methacton/v1/pass_requests', body).subscribe((data)=>{
          console.log('[New Pass]: ', data);
          this.currentPass = Request.fromJSON(data);
          this.showDetails = false;
        });
      }
    } else{
      if (event.type == 'hallpass') {
        if (!event.value) {
          this.endPass(event.id);
        }
      } else if (event.type == 'request') {
  
      } else if (event.type == 'invitation') {
  
      }
    }
  }
}