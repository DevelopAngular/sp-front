import { Component, OnInit } from '@angular/core';

export interface clickEvent{
  date:string;
  duration:number;
}

@Component({
  selector: 'app-request-accept',
  templateUrl: './request-accept.component.html',
  styleUrls: ['./request-accept.component.css']
})

export class RequestAcceptComponent implements OnInit {

  formState = 1;

  date:string;
  duration:number;

  constructor() { }

  ngOnInit() {
    
  }

}
