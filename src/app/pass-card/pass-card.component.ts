import { Component, OnInit, Input } from '@angular/core';
import {Pass, PendingPass, JSONSerializer} from '../models';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.css']
})
export class PassCardComponent implements OnInit {
  @Input()
  pass:any;

  @Input()
  title:string;

  @Input()
  showActivate:boolean;

  @Input()
  forTeacher:boolean;

  @Input()
  isPending:boolean;

  @Input()
  isExpired:boolean;

  studentsAsString:string = "";

  activateVisible:boolean = false;

  infoVisible:boolean = false;
  
  passDate:string;

  constructor(private serializer:JSONSerializer) {}

  ngOnInit() {
    //console.log(this.isPending);
    if(this.pass.students.length == 1){
      this.studentsAsString = this.pass.students[0].display_name;
    } else {
      for(var i = 0; i<this.pass.students.length;i++){
        this.studentsAsString += ", " +this.pass.students[i].first_name;
      }
      if(this.studentsAsString.length > 14)
        this.studentsAsString = this.studentsAsString.substring(1,14) +"...";
      else
        this.studentsAsString = this.studentsAsString.substring(1, this.studentsAsString.length);
    }
    let s = new Date(this.pass.created);
    this.passDate = s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
  
    //console.log("From: ", this.pass.from_location, "To: ", this.pass.to_location);
  
  }
    activate(){
      this.activateVisible = !this.activateVisible;
    }

    getInfo(){
      this.infoVisible = !this.infoVisible;
      console.log(this.infoVisible);
    }

    activatePassUpdate(event){
      this.activateVisible = !event;
    }
}
