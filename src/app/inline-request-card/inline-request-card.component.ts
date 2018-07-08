import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from '../http-service';
import { Util } from '../../Util';
import { Request } from '../NewModels'

@Component({
  selector: 'app-inline-request-card',
  templateUrl: './inline-request-card.component.html',
  styleUrls: ['./inline-request-card.component.scss']
})
export class InlineRequestCardComponent implements OnInit {
  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  
  selectedDuration: number;
  selectedTravelType: string;

  constructor(private http: HttpService) { }

  ngOnInit() {

  }

  formatDateTime(){
    return Util.formatDateTime(this.request.request_time);
  }

}
