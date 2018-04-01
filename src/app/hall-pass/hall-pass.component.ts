import { Component, OnInit, Input } from '@angular/core';
import { Pass } from '../models';

@Component({
  selector: 'app-hall-pass',
  templateUrl: './hall-pass.component.html',
  styleUrls: ['./hall-pass.component.css']
})
export class HallPassComponent implements OnInit {
  @Input()
  hallPass: Pass;
  startS: string;
  endE: string;
  
  constructor() { 
  }

  ngOnInit() {
    //console.log(this.hallPass.start);
    let s = new Date(this.hallPass.created);
    this.startS = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
    
    s = new Date(this.hallPass.expiry_time);
    this.endE = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
  }

}
