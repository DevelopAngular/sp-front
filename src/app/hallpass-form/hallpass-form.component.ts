import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HallPass } from '../hallpass';
@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.css']
})
export class HallpassFormComponent implements OnInit {

  
  durs: string[] = ["3", "5", "10", "15", "30","≥45"];
  public studentName: string = "John Tsting";
  public now: Date = new Date();
  public dateNow: any;
  public timeNow: any;
  public barer: string;
  public isLoggedIn: Boolean = false;
  model = new HallPass('', '', '', '', '');
  
  constructor(private dataService: DataService, private router: Router) {

      setInterval(() => {
        var nowish = new Date();
        this.dateNow = nowish.getMonth() + "/" +nowish.getDay() +"/" +nowish.getFullYear();
        var mins = nowish.getMinutes();
        var hours = nowish.getHours();
        this.timeNow = ((hours>12)?hours-12:hours) +":" +((mins<10)?"0":"") +mins;
      }, 100);
      
  }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    if(this.barer == "")
      this.router.navigate(['../']);
  }

  newPass(){

  }

}