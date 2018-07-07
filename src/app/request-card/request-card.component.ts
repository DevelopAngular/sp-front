import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../NewModels';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';

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
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.request = this.data['pass'];
    this.forInput = this.data['forInput'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
  }

  formatDateTime(){
    return Util.formatDateTime(this.request.request_time);
  }
}
