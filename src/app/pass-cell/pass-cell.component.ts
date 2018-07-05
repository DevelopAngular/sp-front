import { Component, OnInit, Input } from '@angular/core';
import {HallPass, Invitation, Request} from '../NewModels';
import { Util } from '../../Util';

@Component({
  selector: 'app-pass-cell',
  templateUrl: './pass-cell.component.html',
  styleUrls: ['./pass-cell.component.scss']
})
export class PassCellComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() type:string;

  constructor() { }

  ngOnInit() {

  }

  formattedDate(){
    let s:Date = (this.type==='invitation'?this.pass['date_choices'][0]:(this.type==='request')?this.pass['request_time']:this.pass['start_time'])
    return Util.formatDateTime(s);
  }


}
