import { Component, OnInit, Input } from '@angular/core';
import { Template } from '../pass-list/pass-list.component';
import { DataService } from '../data-service';
import { HttpService } from '../http-service';

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

  constructor(private http: HttpService, private dataService: DataService) { }

  ngOnInit() {
    this.dataService.currentBarer.subscribe(barer => this.barer = barer);
    //console.log(this.template.start);
    let s = new Date(this.template.start);
    this.startS = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
    
    s = new Date(this.template.end);
    this.endE = s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() +" - " +((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +"." +((s.getSeconds()<10)?"0":"") +s.getSeconds();
  }

  async activate(){
    console.log("Activating");
    this.dataService.currentUserId.subscribe(userId => this.userId = userId);
    console.log("UserId: " +this.userId);
    //const userId = await this.getUserId();
    var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
    console.log("Config: " +config);
    let body: object = {
      'student': this.userId,
      'template': this.template.id,
    };
    const data = await this.http.post('api/methacton/v1/hall_passes', body, config).toPromise();
    console.log("Data: " +JSON.stringify(data));
    this.dataService.updateTab(1);
  }

  getUserId(){
    return new Promise((resolve, reject) => {
      var config = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      this.http.get('api/methacton/v1/users/@me', config).subscribe((data:any) => {
          this.userId = data.id;
          resolve(data.id);
      }, reject);
    });
  }
}