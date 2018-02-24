import { Component, OnInit, Input } from '@angular/core';
import { Template } from '../pass-list/pass-list.component';
import { DataService } from '../data-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-template-pass',
  templateUrl: './template-pass.component.html',
  styleUrls: ['./template-pass.component.css']
})
export class TemplatePassComponent implements OnInit {

  @Input()
  template: Template;
  startS: string;
  endE: string;
  barer:string;
  userId:string;

  public baseURL = "https://notify-messenger-notify-server-staging.lavanote.com/api/methacton/v1/";

  constructor(private http: HttpClient, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    console.log(this.template.start);
    let s = new Date(this.template.start);
    this.startS = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
    
    s = new Date(this.template.end);
    this.endE = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
  }

  async activate(){
    console.log("Activating");
    const userId = await this.getUserId();
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    console.log("Config: " +config);
    let body: object = {
      'student': userId,
      'template': this.template.id,
    };
    const data = await this.http.post(this.baseURL +'hall_passes', body, config).toPromise();
    console.log("Data: " +data);
    this.dataService.updateTab(1);
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

}
