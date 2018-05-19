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
  hallpass: HallPass

  @Output() onEnd: EventEmitter<any> = new EventEmitter();

  timeLeft: string;
  
  constructor() { }

  ngOnInit() {
    setInterval(()=>{
      if(!!this.hallpass){
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

}
