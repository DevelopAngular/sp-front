import { Component, OnInit, Input } from '@angular/core';
import {HallPass, Invitation, Request} from '../NewModels';
@Component({
  selector: 'app-pass-cell',
  templateUrl: './pass-cell.component.html',
  styleUrls: ['./pass-cell.component.css']
})
export class PassCellComponent implements OnInit {

  @Input() pass: HallPass | Invitation | Request;

  type:string;

  weekday: string[] = ['Sunday', 'Monday', 'Tuesday',
                        'Wednesday', 'Thursday', 'Friday',
                        'Saturday'];

  month: string[] = ['Jan.', 'Feb.', 'Mar.',
                      'Apr.', 'May', 'June',
                      'July', 'Aug.', 'Sept.',
                      'Oct.', 'Nov.', 'Dec.'];

  constructor() { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
    console.log('[Pass Cell Pass]: ', this.pass);
    console.log('[Pass Cell Type]: ', this.type);
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


}
