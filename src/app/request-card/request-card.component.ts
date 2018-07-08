import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../NewModels';
import { Util } from '../../Util';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Inject } from '@angular/core';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss']
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  
  selectedDuration: number;
  selectedTravelType: string;

  constructor(public dialogRef: MatDialogRef<RequestCardComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpService) { }

  ngOnInit() {
    this.request = this.data['pass'];
    this.forInput = this.data['forInput'];
    this.forFuture = this.data['forFuture'];
    this.fromPast = this.data['fromPast'];
  }

  formatDateTime(){
    return Util.formatDateTime(this.request.request_time);
  }

  newRequest(){
    const endPoint: string = 'api/methacton/v1/pass_requests';
    const body = {
          'origin' : this.request.origin.id,
          'destination' : this.request.destination.id,
          'attachment_message' : this.request.attachment_message,
          'travel_type' : this.selectedTravelType,
          'teacher' : this.request.teacher.id,
          'request_time' :this.request.request_time.toISOString(),
          'duration' : this.selectedDuration*60,
        }
    this.http.post(endPoint, body).subscribe((data)=>{
      console.log('[New Request]: ', data);
      this.dialogRef.close();
    });
  }
}
