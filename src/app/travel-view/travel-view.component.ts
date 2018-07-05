import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HallPass, Invitation, Request } from '../NewModels';

@Component({
  selector: 'app-travel-view',
  templateUrl: './travel-view.component.html',
  styleUrls: ['./travel-view.component.scss']
})

export class TravelViewComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() shrink: boolean = false;
  
  @Output() locationSelected: EventEmitter<any> = new EventEmitter();

  type: string;
  
  constructor() { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
  }

}
