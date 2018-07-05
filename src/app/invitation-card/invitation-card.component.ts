import { Component, OnInit, Input } from '@angular/core';
import { Invitation } from '../NewModels';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss']
})
export class InvitationCardComponent implements OnInit {

  @Input() invitation: Invitation;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
