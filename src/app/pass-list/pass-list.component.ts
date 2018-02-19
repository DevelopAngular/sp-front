import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export class HallPass{
  constructor(public toTeacher:string, public toRoom: string, public fromTeacher:string, public fromRoom, public start:string, public end:string, public description:string, public student:string, public creator:string) {

  }
}

@Component({
  selector: 'app-pass-list',
  templateUrl: './pass-list.component.html',
  styleUrls: ['./pass-list.component.css']
})
export class PassListComponent implements OnInit {

  private barer:string;
  private gUser:any;
  activePasses: HallPass[] = [];
  expiredPasses: HallPass[] = [];
  //approvalPasses: TemplatePass[] = [];

  constructor(private http: HttpClient, private dataService: DataService, private router: Router) {
    
  }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    if(this.barer == "")
      this.router.navigate(['../']);  
    else{
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);

      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      this.http.get('https://notify.letterday.info/api/methacton/v1/hall_passes', config).subscribe((data:any[]) => {
        for(var i = 0; i < data.length; i++){
          //console.log(data);
          let date: Date = new Date(data[i]["expiry_time"]);
          if(this.isInFuture(date))
            this.activePasses.push(new HallPass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
          else
            this.expiredPasses.push(new HallPass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
          //console.log(this.passes);
        }
      });
    }
    setInterval(() => {
      for(let pass of this.activePasses.slice()){
        if(!this.isInFuture(new Date(pass.end))){
          //console.log(new Date(pass.end));
          this.activePasses.splice(this.activePasses.indexOf(pass), 1);
          this.expiredPasses.push(pass);
        }
      }
    }, 1000);
  }

  isInFuture(date: Date){
    var now = new Date();
    //console.log("Now: " +now.valueOf());
    //console.log("Expiery: " +date.valueOf());
    return date.valueOf() >= now.valueOf();
  }
}
