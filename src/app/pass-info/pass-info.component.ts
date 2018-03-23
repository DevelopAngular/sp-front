import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpService} from '../http-service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-pass-info',
  templateUrl: './pass-info.component.html',
  styleUrls: ['./pass-info.component.css']
})
export class PassInfoComponent implements OnInit {
  barer;
  id;
  name;
  destination;
  origin;
  timeOut;
  duration;
  issuer;
  description;
  emails;

  constructor(
              public dialogRef: MatDialogRef<PassInfoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private http:HttpService,
              public toastr: ToastsManager,
              vcr: ViewContainerRef){
    this.toastr.setRootViewContainerRef(vcr);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(){
    this.id = this.data['id'];
    this.barer = this.data['barer'];
    console.log("Dialog open and received data: " +this.id);
    console.log(this.id);
    let config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
    this.http.get('api/methacton/v1/hall_passes/' +this.id, config).subscribe(data => {
      console.log("Info for Pass")
      this.name = data['student']['display_name'];
      this.destination = data['to_location']['name'] +" (" +data['to_location']['room'] +")";
      this.origin = data['from_location']['name'] +" (" +data['from_location']['room'] +")";

      let s = new Date(data['created']);
      let startTimeString = ((s.getHours()>12)?s.getHours()-12:s.getHours()) +":" +((s.getMinutes()<10)?"0":"") +s.getMinutes() +" - " +s.getMonth()+1 + "/" +s.getDate() +"/" +s.getFullYear() ;
      this.timeOut = startTimeString;

      let end = +new Date(data['expiry_time']);
      let start = +new Date(data['created']);
      let duration:any = Math.abs(end-start)/1000/60;
      this.duration = duration;

      this.issuer = data['issuer']['display_name']

      this.description = data['description'];
      this.emails = ['kc349@student.methacton.org', 'ds111@student.methacton.org', 'dbontempo@methacton.org'];//data['authorities'];
    });
  }

  verify(){
    console.log("Verifying pass: " +this.id);
    let config = {headers:{'Authorization' : 'Bearer ' +this.barer}};
    this.http.post("api/methacton/v1/hall_passes/" +this.id +"/request_verification", "", config).subscribe();
    this.toastr.success("Emails have been sent to relevant staff.", "Success!", {positionClass: 'toast-bottom-center', animate: 'fade', showCloseButton: true, toastLife: 3000});
  }

}
