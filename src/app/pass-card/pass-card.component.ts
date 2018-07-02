import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HallPass, Invitation, User } from '../NewModels';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.scss']
})
export class PassCardComponent implements OnInit {

  @Input() pass;

  @Input() active: boolean;

  @Input() hasDivider: boolean = false;
  
  @Input() isDetails: boolean = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  timeLeft: string = '00:00';

  returnData:any = {};

  constructor() {

  }

  ngOnInit() {
    setInterval(() => {
      if (!!this.pass && this.active) {
        let end = this.pass.expiration_time;
        let start = new Date();
        let diff: number = Math.floor((end.getTime() - start.getTime()) / 1000);
        let mins: number = Math.floor(diff / 60);
        let secs: number = Math.abs(diff % 60);
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
      }
    }, 1000);
  }

  _cardEvent(value: boolean) {
    let event = {
      'value': value,
      'pass': this.pass,
      'data': this.returnData
    };
    // console.log('[Pass Card Event]: ', event);
    this.cardEvent.emit(event);
  }

  updateDuration(dur:number){
    this.returnData['duration'] = dur;
  }

  updateTravelType(travelType:string){
    this.pass.travel_type = travelType;
  }

}