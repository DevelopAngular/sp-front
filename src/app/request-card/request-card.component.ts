import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../NewModels';
import { Util } from '../../Util';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss']
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  constructor() { }

  ngOnInit() {
    
  }

  formatDateTime(){
    return Util.formatDateTime(this.request.request_time);
  }
}
