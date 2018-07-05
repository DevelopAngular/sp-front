import { Component, OnInit, Input } from '@angular/core';
import { Invitation, Location } from '../NewModels';
import { Util } from '../../Util';

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

  constructor() { }

  ngOnInit() {
    this.selectedOrigin = this.invitation.default_origin;
  }

  formatDateTime(){
    return Util.formatDateTime(this.invitation.date_choices[0]);
  }

}
