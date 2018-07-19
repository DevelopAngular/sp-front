import { Component, OnInit, Input } from '@angular/core';
import { Invitation, HallPass, Request } from '../NewModels';
import { MatDialog } from '@angular/material';
import { PassCardComponent } from '../pass-card/pass-card.component';
import { InvitationCardComponent } from '../invitation-card/invitation-card.component';
import { RequestCardComponent } from '../request-card/request-card.component';

@Component({
  selector: 'app-pass-collection',
  templateUrl: './pass-collection.component.html',
  styleUrls: ['./pass-collection.component.scss']
})
export class PassCollectionComponent implements OnInit {

  @Input() passes: HallPass[] | Invitation[] | Request[];
  @Input() displayState: string = "list";
  @Input() title: string;
  @Input() icon: string;
  @Input() columns: number = 3;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() isActive: boolean = false;
  @Input() forStaff: boolean = false;

  type:string;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.type = (this.passes[0] instanceof HallPass) ? 'hallpass' :
                (this.passes[0] instanceof Invitation) ? 'invitation' :
                'request';
  }

  showPass(pass: HallPass | Invitation | Request){
    this.initializeDialog(this.type==='hallpass'?PassCardComponent:(this.type==='invitation'?InvitationCardComponent:RequestCardComponent), pass);  
  }

  initializeDialog(component: any, pass: any){
    const dialogRef = this.dialog.open(component, {
      panelClass: 'pass-card-dialog-container',
      backdropClass: 'custom-backdrop',
      data: {'pass': pass, 'fromPast': this.fromPast, 'forFuture': this.forFuture}
    });

    dialogRef.afterClosed().subscribe(dialogData => {

    });
  }

}
