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
  passes: HallPass[] = [];

  constructor(private http: HttpClient, private dataService: DataService, private router: Router) {
    
  }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    if(this.barer == "")
      this.router.navigate(['../']);  
  
    this.dataService.currentGUser.subscribe(gUser => this.gUser = gUser);

    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    this.http.get('https://notify.letterday.info/api/methacton/v1/hall_passes', config).subscribe((data:any[]) => {
      for(var i = 0; i < data.length; i++){
        console.log(data);
        this.passes.push(new HallPass(data[i]["to_location"]["name"], data[i]["to_location"]["room"], data[i]["from_location"]["name"], data[i]["from_location"]["room"], data[i]["created"], data[i]["expiry_time"], data[i]["description"], data[i]["student"]["display_name"] ,data[i]["issuer"]["display_name"]));
        console.log(this.passes);
      }
    });

  }

}
