import { Component, OnInit, Input } from '@angular/core';
import { HallPass, Invitation, Request } from '../NewModels';

@Component({
  selector: 'app-travel-view',
  templateUrl: './travel-view.component.html',
  styleUrls: ['./travel-view.component.scss']
})

export class TravelViewComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;

  constructor() { }

  ngOnInit() {
  }

}
