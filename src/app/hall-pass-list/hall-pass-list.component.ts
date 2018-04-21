import { Component, OnInit } from '@angular/core';
import {Pass, PendingPass, JSONSerializer} from '../models';
import { HttpService } from '../http-service';
import { DataService } from '../data-service';

@Component({
  selector: 'app-hall-pass-list',
  templateUrl: './hall-pass-list.component.html',
  styleUrls: ['./hall-pass-list.component.css']
})
export class HallPassListComponent implements OnInit {

  
  public activePasses:Promise<Pass[]>;
  public expiredPasses:Promise<Pass[]>;
  barer;
  
  sortKey: string;

  sortField: string;

  sortOrder: number;

  constructor(private serializer:JSONSerializer, private http:HttpService, private dataService:DataService) { }

  ngOnInit() {
    this.dataService.barerService.subscribe(barer => this.barer = barer);
    const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
    this.activePasses = this.http.get<Pass[]>('api/methacton/v1/hall_passes?active=true', config).toPromise();
    this.expiredPasses = this.http.get<Pass[]>('api/methacton/v1/hall_passes?active=false', config).toPromise();

    setInterval(()=>{
      this.activePasses.then((passes)=>{
        //console.log("[Passes]", passes);
        for(let i = 0; i < passes.length; i++){
          let now:any = new Date();
          let end:any = new Date(passes[i].expiry_time);
          let diff = end - now;
          //console.log("[Diff]", diff);
          if(diff <= 0){
            this.updatePasses();
          }
        }
      });
    }, 1000);
  
  }

  updatePasses(){
    console.log("Updating Passes");
    const config = {headers: {'Authorization': 'Bearer ' + this.barer}};
    this.activePasses = this.http.get<Pass[]>('api/methacton/v1/hall_passes?active=true', config).toPromise();
    this.expiredPasses = this.http.get<Pass[]>('api/methacton/v1/hall_passes?active=false', config).toPromise();
  }

  updatePassUpdate(event){
    console.log("Passes being updated at list level");
  }
}
