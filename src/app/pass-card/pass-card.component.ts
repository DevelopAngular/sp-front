import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {User, HallPass, Request, Invitation} from '../NewModels';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.css']
})
export class PassCardComponent implements OnInit {

  @Input() pass;

  @Input() future:boolean;

  @Input() forTeacher:boolean;

  @Input() expanded:boolean = true;

  @Input() user: User;

  @Output() cardEvent:EventEmitter<any> = new EventEmitter();

  type:string = "";

  timeLeft:string = "00:00";

  weekday:string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  month:string[] = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September","October", "November", "December"];

  constructor() {
    
  }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass)?"hallpass":
    (this.pass instanceof Request)?"request":
    "invitation";
    
    console.log("[Card Type]", this.type);
  }

  _cardEvent(value:boolean){
    let event = {
      'type' : this.type,
      'value' : value
    };

    this.cardEvent.emit(event);
  }

  getGradient(){
    let gradient: string[] = this.pass.gradient_color.split(",");;

    return "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
  }

  getDate(s:Date){
    s = new Date(s);
    return this.weekday[s.getDay()] +' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s:Date){
    s = new Date(s);
    return ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  }

}
