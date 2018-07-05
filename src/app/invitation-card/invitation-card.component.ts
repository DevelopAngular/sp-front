import { Component, OnInit, Input } from '@angular/core';
import { Invitation, Location } from '../NewModels';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    
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

}
