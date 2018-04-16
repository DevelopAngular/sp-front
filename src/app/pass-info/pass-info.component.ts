import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data-service';
import { JSONSerializer, PendingPass } from '../models';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-pass-info',
  templateUrl: './pass-info.component.html',
  styleUrls: ['./pass-info.component.css']
})
export class PassInfoComponent implements OnInit {

  @Input()
  pass;

  @Input()
  isPending;

  @Input()
  forTeacher;

  @Input()
  isExpired;

  passDate;
  duration;
  accepted:any[] = [];
  user;
  verifyVisible;
  cancelVisible;

  constructor(private dataService:DataService, private serializer:JSONSerializer, private http:HttpService) { }

  ngOnInit() {
    this.dataService.currentUser.subscribe(user => this.user = user);
    if(this.isPending && this.forTeacher){
      this.http.get("api/methacton/v1/pending_passes/"+this.pass.id).subscribe((data:any) => {
        this.pass = this.serializer.getPendingPassFromJSON(data);
        for(var i = 0; i < this.pass.activated.length;i++){
          this.accepted.push(this.pass.activated[i].students[0].id);
        }
        //console.log("Accepted ids", this.accepted);
      });
    }
    let s = new Date(this.pass.created);
    this.passDate = s.getMonth() + 1 + '/' + s.getDate() + '/' + s.getFullYear() + ' - ' + ((s.getHours() > 12) ? s.getHours() - 12 : s.getHours()) + ':' + ((s.getMinutes() < 10) ? '0' : '') + s.getMinutes() + ((s.getHours() > 12) ? "pm" : "am");
    if(this.isPending)
      this.duration = this.pass.valid_time/60;
    else{
      //console.log("Not pending");
      let start:any = new Date(this.pass.created);
      let end:any = new Date(this.pass.expiry_time);
      this.duration = Math.abs(end - start)/60000;
      //console.log(typeof this.pass.created, typeof this.pass.expiry_time);
    }
  }

  remind(shouldRemind){
    if(shouldRemind){
      console.log("A reminder to the user will be sent.");
    }else{
      console.log("A reminder to the user will NOT be sent");
    }
  }

  showCancel(){
    this.cancelVisible = true;
  }

  cancel(shouldCancel){
    if(shouldCancel)
      console.log("Deleting pass: " +this.pass.id);
    else
      console.log("Not deleting pass: " +this.pass.id);

    this.cancelVisible = false;
    //this.http.delete("api/methacton/v1/hall_passes/"+this.pass.id);
  }

  showVerify(){
    this.verifyVisible = true;
  }

  verify(shouldVerify){
    if(shouldVerify)
      console.log("Veryfying pass: " +this.pass.id);
    else
      console.log("Not veryfying pass: " +this.pass.id);

    this.verifyVisible = false;
  }
}
