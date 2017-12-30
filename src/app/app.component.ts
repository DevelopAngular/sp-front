import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import {HttpClient} from '@angular/common/http';
 
/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  durs: string[] = ["5","10","15","30","≥45"];

  public now: Date = new Date();
  public dateNow: any;
  public timeNow: any;

  constructor(private http: HttpClient) {

      setInterval(() => {
        var nowish = new Date();
        this.dateNow = nowish.getMonth() + "/" +nowish.getDay() +"/" +nowish.getFullYear();
        var mins = nowish.getMinutes();
        var hours = nowish.getHours();
        this.timeNow = ((hours>12)?hours-12:hours) +":" +((mins<10)?"0":"") +mins;
      }, 100);
      
  }

  ngOnInit(){
      
  }

}