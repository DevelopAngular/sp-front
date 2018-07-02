import { Component, OnInit, Input } from '@angular/core';
import { Invitation } from '../NewModels';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss']
})
export class InvitationCardComponent implements OnInit {

  @Input() pass: Invitation;
  @Input() hasDivider: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
