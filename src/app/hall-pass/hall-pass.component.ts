import { Component, OnInit, Input } from '@angular/core';
import { HallPass } from '../pass-list/pass-list.component';

@Component({
  selector: 'app-hall-pass',
  templateUrl: './hall-pass.component.html',
  styleUrls: ['./hall-pass.component.css']
})
export class HallPassComponent implements OnInit {
  @Input()
  hallPass: HallPass;
  startS: string;
  endE: string;
  constructor() { 
  }

  ngOnInit() {
    //console.log(this.hallPass.start);
    let s = new Date(this.hallPass.start);
    this.startS = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
    
    s = new Date(this.hallPass.end);
    this.endE = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
  }

}
