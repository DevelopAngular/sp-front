import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HallPass} from '../NewModels';
import { Util } from '../../Util';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-pass-card',
  templateUrl: './pass-card.component.html',
  styleUrls: ['./pass-card.component.scss']
})
export class PassCardComponent implements OnInit {

  @Input() pass: HallPass;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;

  @Output() cardEvent: EventEmitter<any> = new EventEmitter();

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 181;

  selectedDuration: number;
  selectedTravelType: string;

  constructor(public dialogRef: MatDialogRef<PassCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpService) {

  }

  ngOnInit() {
    this.pass = this.data['pass'];
    this.forInput = this.data['forInput'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
    setInterval(() => {
      if (!!this.pass && this.isActive) {
        let end: Date = this.pass.expiration_time;
        let now: Date = new Date();
        let diff: number = (end.getTime() - now.getTime()) / 1000;
        let mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        let secs: number = Math.abs(Math.floor(diff) % 60);
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
        this.valid = end > now;

        let start: Date = this.pass.start_time;
        let dur: number = Math.floor((end.getTime() - start.getTime()) / 1000);
        this.overlayWidth = (this.buttonWidth * (diff/dur));
      }
    }, 10);
  }

  updateDuration(dur:number){
    this.returnData['duration'] = dur;
  }

  updateTravelType(travelType:string){
    this.pass.travel_type = travelType;
  }

  formatDateTime(){
    return Util.formatDateTime(this.pass.start_time);
  }

  getDuration(){
    let start: Date = this.pass.start_time;
    let end: Date = this.pass.end_time;
    let timeDiff = Math.abs(start.getTime() - end.getTime());
    let diffSecs = Math.ceil(timeDiff / 1000);
    return Math.floor(diffSecs/60) +':' +(diffSecs%60<10?'0':'') +diffSecs%60;
  }

  newPass(){
    const endPoint:string = 'api/methacton/v1/hall_passes'

    const body = {
      'student' : this.pass.student.id,
      'duration' : this.selectedDuration*60,
      'origin' : this.pass.origin.id,
      'destination' : this.pass.destination.id,
      'travel_type' : this.selectedTravelType,
      'start_time' : this.forFuture?this.pass.start_time.toISOString():null
    };

    this.http.post(endPoint, body).subscribe((data)=>{
      this.dialogRef.close();
    });
  }
  
}