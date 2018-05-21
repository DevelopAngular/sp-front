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
  
  weekday:string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  month:string[] = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September","October", "November", "December"];

  constructor() { }

  ngOnInit() {
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
