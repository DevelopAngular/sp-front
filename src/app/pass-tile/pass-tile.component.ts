import { Component, OnInit, Input, Output } from '@angular/core';
import { HallPass, Request, Invitation } from '../NewModels';
import { bumpIn } from '../animations';
import { EventEmitter } from 'events';

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

  weekday: string[] = ['Sunday', 'Monday', 'Tuesday',
                      'Wednesday', 'Thursday', 'Friday',
                      'Saturday'];
  
  month: string[] = ['Jan.', 'Feb.', 'Mar.',
                    'Apr.', 'May', 'June',
                    'July', 'Aug.', 'Sept.',
                    'Oct.', 'Nov.', 'Dec.'];
  buttonDown = false;
  
  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  constructor() { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
    console.log('[Pass Tile Pass]: ', this.pass);
    console.log('[Pass Tile Type]: ', this.type);
  }

  backgroundGradient(){
    let gradient: string[] = this.pass.gradient_color.split(',');
    return 'radial-gradient(circle at 73% 71%, ' + (this.buttonDown?gradient[1]:gradient[0]) + ', ' + gradient[1] + ')';
  }

  formattedDate(){
    let s:Date = (this.type==='invitation'?this.pass['date_choices'][0]:(this.type==='request')?this.pass['request_time']:this.pass['start_time'])
    let formattedTime:string = ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? ' PM' : ' AM');
    let formattedDate:string = "";
    let now: Date = new Date();

    if(s.getFullYear() === now.getFullYear()){
      if(s.getMonth() === now.getMonth()){
        if(s.getDate() === now.getDate()){
          formattedDate = "Today"
        } else if(s.getDate() === now.getDate()+1){
          formattedDate = "Tomorrow"
        } else if(s.getDate() === now.getDate()-1){
          formattedDate = "Yesterday"
        } else{
          if(s.getDate() > now.getDate()+6 || s.getDate() < now.getDate()-1){
            formattedDate = this.month[s.getMonth()] +" " +s.getDate();
          } else{
            formattedDate = this.weekday[s.getDay()];
          }
        } 
      } else{
        formattedDate = this.month[s.getMonth()] +" " +s.getDate();
      }
    } else{
      return this.month[s.getMonth()] +" " +s.getDate() +", " +s.getFullYear(); 
    }
    return formattedDate +", " +formattedTime;
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

  onClick(event){
    this.tileSelected.emit(event)
  }

}
