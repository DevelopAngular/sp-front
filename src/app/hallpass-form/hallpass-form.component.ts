import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HallPass } from '../hallpass';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-hallpass-form',
  templateUrl: './hallpass-form.component.html',
  styleUrls: ['./hallpass-form.component.css']
})
export class HallpassFormComponent implements OnInit {

  
  durs: string[] = ["3", "5", "10", "15", "30"];
  public now: Date = new Date();
  public dateNow: any;
  public timeNow: any;
  public barer: string;
  public isLoggedIn: Boolean = false;
  public studentName: string;
  public userId;
  public to;
  public from;
  public duration; //<- this is duration
  public gUser;
  public baseURL = "https://notify-messenger-notify-server-staging.lavanote.com/api/methacton/v1/";
  model = new HallPass('', '', '', '', '');
  
  constructor(private http: HttpClient, private dataService: DataService, private router: Router) {

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
    else{
      this.getUserId();
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);
      this.studentName = this.gUser['name'];
    }
  }

  newPass(){
    console.log("Making new pass");
    this.dataService.currentTo.subscribe(to => this.to = to);
    console.log("To: " +this.to);
    this.dataService.currentFrom.subscribe(from => this.from = from);
    console.log("From: " +this.from);

    let data: object = {
                        'student': this.userId,
                        'description': '',
                        'from_location': this.from,
                        'to_location': this.to,
                        'valid_time': (parseInt(this.duration) * 60) +""
                      };
    console.log("Data: " +data['student']);
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    console.log("Config: " +config);
    this.http.post(this.baseURL +'hall_passes', data, config).subscribe((data:any) => {
        console.log("Got data.");
        this.router.navigate(['../main']);
    });
    this.dataService.updateTab(1);
  }
 
  
  getUserId(){
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    this.http.get(this.baseURL +'users/@me', config).subscribe((data:any) => {
        this.userId = data.id;
    });
  }
}