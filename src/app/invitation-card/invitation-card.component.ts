import { Component, OnInit, Input } from '@angular/core';
import { Invitation, Location } from '../NewModels';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Inject } from '@angular/core';
import { InfoEditorComponent } from '../info-editor/info-editor.component';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss']
})
export class InvitationCardComponent implements OnInit {

  @Input() invitation: Invitation;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;

  selectedOrigin: Location;

  constructor(public dialogRef: MatDialogRef<InvitationCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private http: HttpService) {
    
  }

  ngOnInit() {
    this.invitation = this.data['pass'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
    this.selectedOrigin = this.invitation.default_origin;
  }

  formatDateTime(){
    return Util.formatDateTime(this.invitation.date_choices[0]);
  }

  setLocation(location: Location){
    this.invitation.default_origin = location;
    this.selectedOrigin = location;
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
}
