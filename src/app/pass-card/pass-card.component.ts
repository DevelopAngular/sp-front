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

  isPending:boolean;

  studentsAsString:string = "";

  constructor(private serializer:JSONSerializer) {}

  ngOnInit() {
    this.isPending = this.pass instanceof PendingPass;
    if(this.pass.students.length == 1){
      this.studentsAsString = this.pass.students[0].display_name;
    } else {
      for(var i = 0; i<this.pass.students.length;i++){
        this.studentsAsString += ", " +this.pass.students[i].first_name;
      }
      if(this.studentsAsString.length > 14)
        this.studentsAsString = this.studentsAsString.substring(1,14) +"...";
    }
    
    

  }

}
