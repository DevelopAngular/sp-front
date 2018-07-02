import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HallPass} from '../NewModels';
import { Util } from '../../Util';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.scss']
})
export class PassCardComponent implements OnInit {

  @Input() pass: HallPass;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  timeLeft: string = '00:00';

  returnData: any = {};

  constructor() {

  }

  ngOnInit() {
    setInterval(() => {
      if (!!this.pass && this.isActive) {
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

  formatDatedTime(){
    return Util.formatDateTime(this.pass.start_time);
  }

  getDuration(){
    let start: Date = this.pass.start_time;
    let end: Date = this.pass.end_time;
    let timeDiff = Math.abs(start.getTime() - end.getTime());
    let diffSecs = Math.ceil(timeDiff / 1000);
    return Math.floor(diffSecs/60) +':' +diffSecs%60;
  }

}