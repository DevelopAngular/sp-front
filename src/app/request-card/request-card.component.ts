import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../NewModels';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss']
})
export class RequestCardComponent implements OnInit {

  @Input() pass: Request;
  @Input() hasDivider: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
