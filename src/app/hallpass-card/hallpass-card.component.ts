import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { MatAccordionDisplayMode } from '@angular/material';
import { HallPass } from '../NewModels';

@Component({
  selector: 'app-hallpass-card',
  templateUrl: './hallpass-card.component.html',
  styleUrls: ['./hallpass-card.component.css']
})
export class HallpassCardComponent implements OnInit {

  @Input()
  hallpass: HallPass;

  @Input()
  future: boolean = false;

  @Output() onEnd: EventEmitter<any> = new EventEmitter();

  timeLeft: string;
  
  weekday:string[];
  month:string[];

  constructor() { }

  ngOnInit() {

    this.weekday[0] = "Sunday";
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

    setInterval(()=>{
      if(!!this.hallpass && !this.future){
        let end = this.hallpass.expiration_time;
        let start = new Date();
        let diff:number = Math.floor((end.getTime() - start.getTime()) / 1000);
        let mins: number = Math.floor(diff/60);
        let secs: number = Math.abs(diff%60);
        this.timeLeft = mins +":" +(secs<10?"0"+secs:secs);
      }
    }, 1000);
  }

  endPass(){
    console.log("Ending Pass");
    this.onEnd.emit(this.hallpass);
  }

  getGradient(){
    let gradient: string[] = this.hallpass.gradient_color.split(",");;

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
