import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Invitation } from '../NewModels';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.css']
})
export class InvitationCardComponent implements OnInit {

  @Input()
  invitation:Invitation;

  @Output()
  onSelect:EventEmitter<any> = new EventEmitter();

  weekday = [];
  month = [];


  constructor() { }

  ngOnInit() {
    this.weekday[0] =  "Sunday";
    this.weekday[1] = "Monday";
    this.weekday[2] = "Tuesday";
    this.weekday[3] = "Wednesday";
    this.weekday[4] = "Thursday";
    this.weekday[5] = "Friday";
    this.weekday[6] = "Saturday";

    this.month[0] = "January";
    this.month[1] = "February";
    this.month[2] = "March";
    this.month[3] = "April";
    this.month[4] = "May";
    this.month[5] = "June";
    this.month[6] = "July";
    this.month[7] = "August";
    this.month[8] = "September";
    this.month[9] = "October";
    this.month[10] = "November";
    this.month[11] = "December";
  }

  getGradient(){
    // let gradient: string[] = this.invitation.gradient_color.split(",");;

    // return "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
    return "radial-gradient(circle at 73% 71%, #567890, #235678)";
  }

  getDate(s:Date){
    return this.weekday[s.getDay()] +' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s:Date){
    return ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  }

  activateInvitation(){
    
  }

}
