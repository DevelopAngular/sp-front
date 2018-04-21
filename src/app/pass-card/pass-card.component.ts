import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Pass, PendingPass, JSONSerializer} from '../models';
import { ConfirmationService } from 'primeng/api';
import { HttpService } from '../http-service';
import {Message} from 'primeng/components/common/api';
import { DataService } from '../data-service';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.css']
})
export class PassCardComponent implements OnInit {
  @Input()
  pass:any;

  @Input()
  title:string;

  @Input()
  showActivate:boolean;

  @Input()
  forTeacher:boolean;

  @Input()
  isPending:boolean;

  @Input()
  isExpired:boolean;

  @Output() updateCardPassEvent: EventEmitter<null> = new EventEmitter();

  user;

  studentsAsString:string = "";

  activateVisible:boolean = false;

  infoVisible:boolean = false;
  
  passDate:string;
  startDate:string;
  subtitle:string;
  timeLeftStr:string;
  timeLeft:number;
  duration:number;
  
  available:boolean;

  msgs:Message[] = [];
  constructor(private serializer:JSONSerializer, private confirmationService: ConfirmationService, private http: HttpService, private dataService: DataService) {}

  ngOnInit() {
    this.dataService.currentUser.subscribe(user => this.user = user);
    let now = new Date();
    this.available = this.pass.start_time >= now;
    if(this.isPending)
      this.duration = this.pass.valid_time/60;
    else{
      //console.log("Not pending");
      let start:any = new Date(this.pass.created);
      let end:any = new Date(this.pass.expiry_time);
      this.duration = Math.abs(end - start)/60000;
    }
    if(this.pass.students.length == 1){
      this.studentsAsString = this.pass.students[0].display_name;
    } else {
      for(var i = 0; i<this.pass.students.length;i++){
        this.studentsAsString += ", " +this.pass.students[i].first_name;
      }
      if(this.studentsAsString.length > 14)
        this.studentsAsString = this.studentsAsString.substring(1,14) +"...";
      else
        this.studentsAsString = this.studentsAsString.substring(1, this.studentsAsString.length);
    }
    let s = new Date(this.pass.created);
    this.passDate = s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
    s = new Date(this.pass.start_time);
    this.startDate = s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
    this.subtitle = "Issued: " +this.passDate;
    if(this.isPending){
      this.subtitle = "Starts: " +this.startDate;
    }
    //console.log("From: ", this.pass.from_location, "To: ", this.pass.to_location);
    setInterval(()=>{
      let now:any = new Date();
      let end:any = new Date(this.pass.expiry_time);
      let diff = (end - now)/60000;
      this.timeLeft = diff;
      //console.log("[Diff]", diff);
      var mins = Math.floor(diff);
      var secs = diff - mins;
      secs = Math.round(secs*60);
      this.timeLeftStr = mins +"m " +secs +"s";
    }, 1000);
  }
    activate(){
      if(!!this.pass.from_location){
        this.confirmationService.confirm({
          message: 'Are you sure you want to activate this pass?',
          header: 'Activate Pass',
          accept: () => {
            let data = {
              'student': this.user.id,
              'pending_pass': this.pass.id,
            };
  
            var config = {headers:{'Authorization' : 'Bearer '}}
            this.http.post('api/methacton/v1/hall_passes', data, config).subscribe((data:any) => {
              console.log(data);
              this.dataService.updateTab(1);
            });
            this.msgs.push({severity:'success', summary:'Activated', detail:'The pass was activated!'});
          },
          reject: () => {
            this.msgs.push({severity:'error', summary:'Not Activated', detail:'The pass was not activated.'});
          }
      });
      } else{
        this.activateVisible = !this.activateVisible;
      }
    }

    getInfo(){
      this.infoVisible = !this.infoVisible;
      console.log(this.infoVisible);
    }

    activatePassUpdate(event){
      this.activateVisible = !event;
    }

    updatePassUpdate(event){
      this.dataService.updateTab(0);
      setTimeout(()=>{
        this.dataService.updateTab(1);
      }, 50)
    }
}
