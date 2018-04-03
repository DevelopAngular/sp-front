import { Component, OnInit, ViewChild, ElementRef, Input, Output} from '@angular/core';
import { DataService } from '../data-service';
import { Router } from '@angular/router';
import { HttpService } from '../http-service';
import {Pass} from '../models';
import {PendingPass} from '../models';
declare var document: any;

@Component({
  selector: 'app-pass-list',
  templateUrl: './pass-list.component.html',
  styleUrls: ['./pass-list.component.css']
})

export class PassListComponent implements OnInit {
  @Input()
  selectedIndex: any;

  private barer: string;
  private gUser: any;
  private user: any;
  public isStaff = false;
  activePasses: Pass[] = [];
  expiredPasses: Pass[] = [];
  templates: PendingPass[] = [];
  show = false;
  currentOffset = 0;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  //approvalPasses: TemplatePass[] = [];

  constructor(private http: HttpService, private dataService: DataService, private router: Router) {

  }

  ngOnInit() {
    this.show = false;
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    this.dataService.currentTab.subscribe(selectedIndex => this.selectedIndex = selectedIndex);
    if (this.barer == '')
      this.router.navigate(['../']);
    else{
      this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);
      this.dataService.currentUser.subscribe(user => {this.user = user; this.isStaff = this.user.isStaff; });
      this.isStaff = this.user['is_staff'];
      console.log('Tabs is staff: ' + this.isStaff);
      let config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      console.log('Getting passes from server.');
      this.http.get('api/methacton/v1/hall_passes?limit=10', config).subscribe((dataA: any) => {
        const data = dataA['results'];
        console.log('Server responded with passes.');
        console.log('Adding and displaying passes.');
        for (let i = 0; i < data.length; i++){
          //console.log(data);
          const date: Date = new Date(data[i]['expiry_time']);
          //if(this.isInFuture(date))
            //this.activePasses.push(new Pass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
          //else
            //this.expiredPasses.push(new Pass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
          //console.log(this.passes);
        }
        console.log('Done adding and displaying passes.');
        this.show = true;
        this.currentOffset = 10;
      });
      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      //TODO &active=true
      this.http.get('api/methacton/v1/pending_passes', config).subscribe((data: any) => {
        for (let i = 0; i < data.length; i++){
            //console.log(data[i]);
            this.templates.push();
          //console.log(this.passes);
        }
      });

      setInterval(() => {
        for (const pass of this.activePasses.slice()){
          if (!this.isInFuture(new Date())){ //FIX THIS
            //console.log(new Date(pass.end));
            this.activePasses.splice(this.activePasses.indexOf(pass), 1);
            this.expiredPasses.push(pass);
          }
        }
      }, 15000);
    }
  }

  isInFuture(date: Date){
    const now = new Date();
    //console.log("Now: " +now.valueOf());
    //console.log("Expiery: " +date.valueOf());
    return date.valueOf() >= now.valueOf();
  }

  toTop(){
    //console.log("Going to top.");
    try {
      const interval = setInterval(() => {
        if (!(document.scrollingElement.scrollTop < 1))
          document.scrollingElement.scrollTop = document.scrollingElement.scrollTop - document.scrollingElement.scrollTop / 10;
        else
          clearInterval(interval);
      }, 15);
    } catch (err) {
      console.log('Error: ' + err);
    }
  }

  tabChange(){
    if (this.selectedIndex == 1){
      console.log(this.selectedIndex);
      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      this.http.get('api/methacton/v1/hall_passes?active=true', config).subscribe((data: any) => {
        const tempPasses: Pass[] = [];
        for (let i = 0; i < data.length; i++){
          //tempPasses.push(new Pass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
        }
        console.log('TempPases: ' + tempPasses);
        this.activePasses = tempPasses;
      });
    }
  }

  onScroll(){
    //console.log(document.scrollingElement.scrollTopMax - document.scrollingElement.scrollTop);
    if ((document.scrollingElement.scrollTopMax - document.scrollingElement.scrollTop) < 10){
      console.log('Getting new passes.');
      const config = {headers: {'Authorization' : 'Bearer ' + this.barer}};
      this.http.get('api/methacton/v1/hall_passes?active=false&limit=10&offset=' + this.currentOffset, config).subscribe((dataA: any) => {
        const data = dataA['results'];
        for (let i = 0; i < data.length; i++){
          //this.expiredPasses.push(new Pass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"], data[i]["issuer"]["display_name"]));
        }
        this.currentOffset = this.currentOffset + 10;
      });
    }
  }
}
