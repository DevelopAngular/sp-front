import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HallPass, Invitation, User } from '../NewModels';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.css']
})
export class PassCardComponent implements OnInit {

  @Input() pass;

  @Input() future: boolean;

  @Input() forTeacher: boolean;

  @Input() expanded: boolean = true;

  @Input() user: User;

  @Input() isDetails: boolean = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  type: string = '';

  timeLeft: string = '00:00';

  returnData:any = {};

  weekday: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  month: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  constructor() {

  }

  ngOnInit() {
    console.log('[Pass]: ', this.pass);
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
      (this.pass instanceof Invitation) ? 'invitation' :
        'request';

    console.log('[Card Type]', this.type);

    if (this.type == 'hallpass') {
      setInterval(() => {
        if (!!this.pass && !this.future) {
          let end = this.pass.expiration_time;
          let start = new Date();
          let diff: number = Math.floor((end.getTime() - start.getTime()) / 1000);
          let mins: number = Math.floor(diff / 60);
          let secs: number = Math.abs(diff % 60);
          this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
        }
      }, 1000);
    }
  }

  _cardEvent(value: boolean) {
    let event = {
      'type': this.type,
      'value': value,
      'pass': this.pass,
      'data': this.returnData
    };
    console.log('[Pass Card Event]: ', event);
    this.cardEvent.emit(event);
  }

  getGradient() {
    let gradient: string[] = this.pass.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }

  getDate(s: Date) {
    s = new Date(s);
    return this.weekday[s.getDay()] + ' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s: Date) {
    s = new Date(s);
    return ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? 'pm' : 'am');
  }

  updateDuration(dur:number){
    this.returnData['duration'] = dur;
  }

  updateTravelType(travelType:string){
    this.pass.travel_type = travelType;
  }

}