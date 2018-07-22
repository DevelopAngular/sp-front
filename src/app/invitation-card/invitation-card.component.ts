import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Invitation, Location, User } from '../NewModels';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Inject } from '@angular/core';
import { InfoEditorComponent } from '../info-editor/info-editor.component';
import { HttpService } from '../http-service';
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { HallpassFormComponent } from '../hallpass-form/hallpass-form.component';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss']
})
export class InvitationCardComponent implements OnInit {

  @Input() invitation: Invitation;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forStaff: boolean = false;
  @Input() selectedStudents: User[] = [];

  selectedOrigin: Location;
  denyOpen: boolean = false;
  selectedDuration: number;
  selectedTravelType: string;
  constructor(public dialogRef: MatDialogRef<InvitationCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private http: HttpService) {
    
  }

  ngOnInit() {
    this.invitation = this.data['pass'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
    this.forStaff = this.data['forStaff'];
    this.selectedStudents = this.data['selectedStudents'];

    this.selectedOrigin = this.invitation.default_origin;
  }

  formatDateTime(){
    return Util.formatDateTime(this.invitation.date_choices[0]);
  }

  setLocation(location: Location){
    this.invitation.default_origin = location;
    this.selectedOrigin = location;
  }

  newInvitation(){
    const endPoint:string = 'api/methacton/v1/invitations/bulk_create';

    const body = {
      'students' : this.selectedStudents.map(user => user.id),
      'default_origin' : this.invitation.default_origin?this.invitation.default_origin.id:null,
      'destination' : this.invitation.destination.id,
      'date_choices' : this.invitation.date_choices.map(date => date.toISOString()),
      'duration' : this.selectedDuration*60,
      'travel_type' : this.selectedTravelType
    }

    this.http.post(endPoint, body).subscribe((data)=>{
      this.dialogRef.close();
    });
  }

  acceptInvitation(){
    let endpoint: string = 'api/methacton/v1/' +this.invitation.id +'/accept';
    let body = {
      'date' : this.invitation.date_choices[0],
      'origin' : this.selectedOrigin
    }

    this.http.post(endpoint, body).subscribe((data)=>{
      console.log('[Invitation Accepted]: ', data);
      this.dialogRef.close();
    });
  }

  denyInvitation(evt: MouseEvent){
    if(!this.denyOpen){
      const target = new ElementRef(evt.currentTarget);
      const consentDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': 'Are you sure you want to decline this invite?', 'confirm': 'Decline', 'deny': 'Close', 'trigger': target}
      });
  
      consentDialog.afterOpen().subscribe( () =>{
        this.denyOpen = true;
      });
  
      consentDialog.afterClosed().subscribe(consentData =>{
        this.denyOpen = false;
        let shouldDeny = consentData==null?false:consentData;
        if(shouldDeny){
          let endpoint: string = 'api/methacton/v1/invitations/' +this.invitation.id +'/deny';
          let body = {
            'message' : ''
          }
          this.http.post(endpoint, body).subscribe((httpData)=>{
            console.log('[Invitation Denied]: ', httpData);
            this.dialogRef.close();
          });
        }
      });
    }
  }
}
