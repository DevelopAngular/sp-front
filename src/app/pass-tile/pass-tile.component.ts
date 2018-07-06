import { Component, OnInit, Input, Output } from '@angular/core';
import { HallPass, Request, Invitation } from '../NewModels';
import { bumpIn } from '../animations';
import { EventEmitter } from 'events';
import { Util } from '../../Util';

@Component({
  selector: 'app-pass-tile',
  templateUrl: './pass-tile.component.html',
  styleUrls: ['./pass-tile.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PassTileComponent implements OnInit {

  @Input() pass: HallPass | Request | Invitation;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;
  @Input() type:string;

  @Output() tileSelected = new EventEmitter();

  buttonDown = false;
  
  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  constructor() { }

  ngOnInit() {
    
  }

  backgroundGradient(){
    if(this.buttonDown){
      return this.pass.color_profile.pressed_color;
    } else{
      let gradient: string[] = this.pass.color_profile.gradient_color.split(',');
      return 'radial-gradient(circle at 73% 71%, ' + (gradient[0]) + ', ' + gradient[1] + ')';
    }
  }

  formattedDate(){
    let s:Date = (this.type==='invitation'?this.pass['date_choices'][0]:(this.type==='request')?this.pass['request_time']:this.pass['start_time'])
    return Util.formatDateTime(s)
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

  onClick(event){
    this.tileSelected.emit(event)
  }

}
