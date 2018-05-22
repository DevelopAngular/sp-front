import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { Pass, PendingPass } from '../models';
import { MatDialog } from '@angular/material';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HallPass, HallPassSummary, Invitation, Request, User } from '../NewModels';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

function isUserStaff(user: User): boolean {
  return user.roles.includes('edit_all_hallpass');
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  @Input()
  selectedIndex: any;
  activePasses: Pass[] = [];
  expiredPasses: Pass[] = [];
  templates: PendingPass[] = [];
  show = false;
  currentOffset = 0;
  currentPass: HallPass;
  futurePasses: HallPass[];
  timeLeft: string;

  // -----------------------NEW STUFF--------------------- //
  checkedPasses: boolean = false;
  invitations: Promise<Invitation[]>;
  requests: Promise<Request[]>;

  constructor(private http: HttpService, private dataService: DataService, private router: Router, public dialog: MatDialog) {
  }

  get isStaff(): Observable<boolean> {
    return this.dataService.currentUser.map(isUserStaff);
  }

  ngOnInit() {
    this.dataService.currentTab.subscribe(selectedIndex => this.selectedIndex = selectedIndex);

    this.invitations = this.http.get<Invitation[]>('api/methacton/v1/invitations?status=pending').toPromise();
    this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests?status=pending').toPromise();

    this.isStaff.subscribe(isStaff => {
      if (!isStaff) {
        this.http.get<HallPassSummary>('api/methacton/v1/hall_passes/summary').toPromise().then(data => {
          this.currentPass = (!!data['active_pass']) ? HallPass.fromJSON(data['active_pass']) : null;
          this.checkedPasses = true;
          if (!!data['future_passes']) {
            for (let i = 0; i < data['future_passes'].length; i++) {
              this.futurePasses.push(HallPass.fromJSON(data['future_passes'][i]));
            }
          } else {
            this.futurePasses = null;
          }
        });
      } else {
        this.checkedPasses = true;
      }
    });

  }

  showForm(): void {
    const dialogRef = this.dialog.open(HallpassFormComponent, {
      width: '750px'
    });

    dialogRef.afterClosed().subscribe((result: Object) => {
      if (result instanceof HallPass) {
        if (!this.isStaff) {
          this.currentPass = result;
        }
      } else if (result instanceof Request) {
        this.updateRequests();
      } else if (result instanceof Invitation) {
        this.updateInvites();
      }
    });
  }


  endPass(hallpass: HallPass) {
    // console.log("Ending pass");
    this.http.post('api/methacton/v1/hall_passes/' + this.currentPass.id + '/ended', null, {'': ''}).subscribe((results) => {
    });
    this.currentPass = null;
  }

  updateInvites() {
    this.invitations = this.http.get<Invitation[]>('api/methacton/v1/invitations?status=pending').toPromise();
  }

  updateRequests() {
    this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests?status=pending').toPromise();
  }

}
