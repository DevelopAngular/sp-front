import { Component, OnInit, ViewChild, ElementRef, Input, Output, Inject} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { Pass } from '../models';
import { PendingPass } from '../models';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HallPass, Location, Invitation, Request, User } from '../NewModels';

export interface Paged<T> {
  active_pass: T;
  pass_history: T[];
  future_passes: T[];
}

declare var document: any;

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})

export class MainPageComponent implements OnInit {
  @Input()
  selectedIndex: any;

  private barer: string;
  private gUser: any;
  private user: any;
  public isStaff = false;
  activePasses: Pass[] = [];
  expiredPasses: Pass[] = [];
  templates: PendingPass[] = [];
  show = false;
  currentOffset = 0;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

//------------------------NEW STUFF----------------------//

  currentPass: HallPass;
  futurePasses: HallPass[];
  timeLeft: string;
  checkedPasses: boolean = false;
  invitations:Promise<Invitation[]>;
  requests:Promise<Request[]>;

  constructor(private http: HttpService, private dataService: DataService, private router: Router, public dialog: MatDialog) {

  }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.dataService.currentTab.subscribe(selectedIndex => this.selectedIndex = selectedIndex);
    if (this.barer == '')
      this.router.navigate(['../']);
    else{
      this.dataService.currentUser.subscribe(user => this.user = user);
      this.isStaff = this.user.roles.includes('edit_all_hallpass');
      if(this.isStaff)
        this.invitations = this.http.get<Invitation[]>('api/methacton/v1/invitations?status=pending').toPromise();
      this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests?status=pending').toPromise();
      if(!this.isStaff){
        this.http.get<Paged<HallPass>>('api/methacton/v1/hall_passes/summary').toPromise().then(data => {
          this.currentPass = (!!data['active_pass'])?HallPass.fromJSON(data['active_pass']):null;
          this.checkedPasses = true;
          if(!!data['future_passes']){
            for(let i = 0; i<data['future_passes'].length;i++){
              this.futurePasses.push(HallPass.fromJSON(data['future_passes'][i]));
            }
          } else{
            this.futurePasses = null;
          }
        });
      } else{
        this.checkedPasses = true;
      }
    }
  }

  showForm(): void {
    let dialogRef = this.dialog.open(HallpassFormComponent, {
      width: '750px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result instanceof HallPass){
        if(!this.isStaff)
          this.currentPass = result;
      } else if(result instanceof Request){
        this.updateRequests();
      } else if(result instanceof Invitation){
        if(!this.isStaff)
          this.updateInvites();
      }
    });
  } 


  endPass(hallpass:HallPass){
    // console.log("Ending pass");
    this.http.post('api/methacton/v1/hall_passes/' +this.currentPass.id +'/ended', null, {'':''}).subscribe((results) => {
    });
    this.currentPass = null;
  }

  updateInvites(){
    this.invitations = this.http.get<Invitation[]>('api/methacton/v1/invitations?status=pending').toPromise();
  }

  updateRequests(){
    this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests?status=pending').toPromise();
  }

}
