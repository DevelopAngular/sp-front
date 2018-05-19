import { Component, OnInit, ViewChild, ElementRef, Input, Output, Inject} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import { Pass } from '../models';
import { PendingPass } from '../models';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';
import { HallPass, Location, Invitation, Request, User } from '../NewModels';

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
  timeLeft: string;
  // invitations:Invitation[] = [];
  // requests:Request[] = [];
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
      // let destination: Location = new Location("1", "Library", "", "Lib", "", true, [""], [""], null, 4);
      // let issuer: User = new User("1", null, null, "", "", "Dr. Bruh", "", [""]);
      // let invitation: Invitation = new Invitation("1", null, destination, destination, [new Date(), new Date], issuer, "", 5, "#808975,#567123" , "./assets/One_Arrow.png");
      // this.invitations.push(invitation);
      // let request:Request = new Request("1", null, destination, "", "one_way", "pending", null);
      // this.requests.push(request);
      this.invitations = this.http.get<Invitation[]>('api/methacton/v1/invitations').toPromise();
      this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests').toPromise();
      this.http.get<any[]>('api/methacton/v1/hall_passes/summary').subscribe((data:any[])=>{
        this.currentPass = (!!data['active_pass'])?HallPass.fromJSON(data['active_pass']):null;
        this.checkedPasses = true;
      });
    }
  }

  showForm(): void {
    let dialogRef = this.dialog.open(HallpassFormComponent, {
      width: '750px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log((result instanceof HallPass)?"HallPass":"Request");
      if(result instanceof HallPass){
        this.currentPass = result;
      } else{
        this.requests = this.http.get<Request[]>('api/methacton/v1/pass_requests').toPromise();
      }
      //this.animal = result;
    });
  } 


  endPass(hallpass:HallPass){
    console.log("Ending pass");
    this.http.post('api/methacton/v1/hall_passes/' +this.currentPass.id +'/ended', null, {'':''}).subscribe((results) => {

    });
    this.currentPass = null;
  }

}