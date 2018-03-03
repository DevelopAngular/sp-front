import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';

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
  
  constructor(private http: HttpClient, private newHttp: HttpService, private dataService: DataService, private router: Router) {

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
      this.setupUserId();
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);
      this.studentName = this.gUser['name'];
    }
  }

  newPass(){
    console.log("Making new pass");
    this.dataService.currentTo.subscribe(to => this.to = to);
    //console.log("To: " +this.to);
    this.dataService.currentFrom.subscribe(from => this.from = from);
    //console.log("From: " +this.from);
    this.dataService.currentUserId.subscribe(userId => this.userId = userId);
    console.log("UserId: " +this.userId);
    let data: object = {
                        'student': this.userId,
                        'description': '',
                        'from_location': this.from,
                        'to_location': this.to,
                        'valid_time': (parseInt(this.duration) * 60) +""
                      };
    //console.log("Data: " +data['student']);
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    //console.log("Config: " +config);
    this.http.post(this.baseURL +'hall_passes', data, config).subscribe((data:any) => {
        console.log("Got data.");
        //this.router.navigate(['../main']);
    });
    this.dataService.updateTab(1);
  }
 
  
  async setupUserId(){
    const tempId = await this.getUserId();
    this.dataService.updateUserId(tempId);
  }

  
  getUserId(){
    return new Promise((resolve, reject) => {
      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      this.http.get(this.baseURL +'users/@me', config).subscribe((data:any) => {
          this.userId = data.id;
          resolve(data.id);
      }, reject);
    });
  }
  
  
  // getUserId(){
  //   console.log("Setting UserId.");
  //   var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    
  //   var newData = this.newHttp.get("api/methacton/v1/users/@me", config);

  //   this.dataService.updateUserId(newData.id);
  //   console.log("Dong setting UserId");
  //   // this.http.get(this.baseURL +'users/@me', config).subscribe((data:any) => {
  //   //   this.dataService.updateUserId(data.id);
  //   // });
    
  // }
}