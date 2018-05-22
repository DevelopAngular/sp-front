import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Request } from '../NewModels';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css']
})
export class RequestCardComponent implements OnInit {

  @Input()
  request:Request;

  @Input()
  forTeacher:boolean = false;

  @Output() onAccept: EventEmitter<any> = new EventEmitter();

  weekday:string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  month:string[] = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September","October", "November", "December"];

  constructor() { }

  ngOnInit() {
    
  }


  getGradient(){
    let gradient: string[] = this.request.gradient_color.split(",");
    return "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
    // return "radial-gradient(circle at 73% 71%, #AA11FF, #FF11AA)";
  }

  getDate(s:Date){
    s = new Date(s);
    return this.weekday[s.getDay()] +' ' + this.month[s.getMonth()] + ' ' + (s.getDate());
  }

  getTime(s:Date){
    s = new Date(s);
    return ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  }

  acceptRequest(){

  }

}
