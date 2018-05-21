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

  constructor() { }

  ngOnInit() {
  }


  getGradient(){
    let gradient: string[] = this.request.gradient_color.split(",");
    return "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
    // return "radial-gradient(circle at 73% 71%, #AA11FF, #FF11AA)";
  }

}
