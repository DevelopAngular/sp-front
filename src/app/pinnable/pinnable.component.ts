import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Pinnable} from '../NewModels';
@Component({
  selector: 'app-pinnable',
  templateUrl: './pinnable.component.html',
  styleUrls: ['./pinnable.component.css']
})
export class PinnableComponent implements OnInit {

  @Input()
  pinnable: Pinnable;

  restricted: boolean = false;

  @Output() onSelectEvent: EventEmitter<Pinnable> = new EventEmitter();

  constructor() {
    
  }

  ngOnInit() {
    if(!!this.pinnable.location){
      this.restricted = this.pinnable.location.restricted;
    }
  }

  onSelect(){
    console.log("Pinnable Selected");
    this.onSelectEvent.emit(this.pinnable);
  }

  getGradient(special){
    let gradient: string[] = this.pinnable.gradient_color.split(",");;

    return "radial-gradient(circle at 73% 71%, " +gradient[0] +", " +gradient[1] +")";
  }

}
