import { Component, OnInit, ViewChild, ElementRef, Input, Output} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export class HallPass{
  constructor(public toTeacher:string, public toRoom: string, public fromTeacher:string, public fromRoom, public start:string, public end:string, public description:string, public student:string, public creator:string) {

  }
}

export class Template{
  constructor(public toTeacher:string, public toRoom: string, public fromTeacher:string, public fromRoom, public start:string, public end:string, public description:string, public student:string, public creator:string, public id:string) {

  }
}

declare var document: any;

@Component({
  selector: 'app-pass-list',
  templateUrl: './pass-list.component.html',
  styleUrls: ['./pass-list.component.css']
})



export class PassListComponent implements OnInit {
  @Input()
  selectedIndex: any;

  private barer:string;
  private gUser:any;
  activePasses: HallPass[] = [];
  expiredPasses: HallPass[] = [];
  templates: Template[] = [];
  show:boolean = false;
  public baseURL = "https://notify-messenger-notify-server-staging.lavanote.com/api/methacton/v1/";
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  
  //approvalPasses: TemplatePass[] = [];

  constructor(private http: HttpClient, private dataService: DataService, private router: Router) {
    
  }
  
  ngOnInit() {
    this.show = false;
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.dataService.currentTab.subscribe(selectedIndex => this.selectedIndex = selectedIndex);

    if(this.barer == "")
      this.router.navigate(['../']);  
    else{
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);

      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      console.log("Getting from server.");
      this.http.get(this.baseURL +'hall_passes?limit=50', config).subscribe((dataA:any[]) => {
        let data = dataA['results'];
        console.log("Server responded.");
        console.log("Adding and displaying.");
        for(var i = 0; i < data.length; i++){
          //console.log(data);
          let date: Date = new Date(data[i]["expiry_time"]);
          if(this.isInFuture(date))
            this.activePasses.push(new HallPass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
          else
            this.expiredPasses.push(new HallPass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
          //console.log(this.passes);
        }
        console.log("Done adding and displaying.");
        this.show = true;
      });
      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      this.http.get(this.baseURL +'template_passes', config).subscribe((data:any[]) => {
        for(var i = 0; i < data.length; i++){
            console.log(data[i]);
            this.templates.push(new Template(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["start_time"], data[i]["end_time"], data[i]["description"], data[i]["students"][0]["display_name"], data[i]["issuer"]["display_name"], data[i]['id']));
          //console.log(this.passes);
        }
      });

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
  }

  isInFuture(date: Date){
    var now = new Date();
    //console.log("Now: " +now.valueOf());
    //console.log("Expiery: " +date.valueOf());
    return date.valueOf() >= now.valueOf();
  }

  toTop(){
    //console.log("Going to top.");
    try {
      var interval = setInterval(() => {
        if(!(document.scrollingElement.scrollTop < 1))
          document.scrollingElement.scrollTop = document.scrollingElement.scrollTop - document.scrollingElement.scrollTop/10;
        else
          clearInterval(interval);
      }, 15);
    } catch(err) {
      console.log("Error: " +err);
    }    
  }

  tabChange(){
    if(this.selectedIndex){
      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      this.http.get(this.baseURL +'hall_passes?active=true', config).subscribe((data:any[]) => {
        let tempPasses:HallPass[] = [];
        for(var i = 0; i < data.length; i++){
          tempPasses.push(new HallPass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
        }
        this.activePasses = tempPasses;
      });
    }
  }
}
