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

  @Output() tileSelected = new EventEmitter();

  type:string;

  buttonDown = false;
  
  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  constructor() { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
  }

  backgroundGradient(){
    let gradient: string[] = this.pass.gradient_color.split(',');
    return 'radial-gradient(circle at 73% 71%, ' + (this.buttonDown?gradient[1]:gradient[0]) + ', ' + gradient[1] + ')';
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
