import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HallPass} from '../models/HallPass';
import { Util } from '../../Util';
import { HttpService } from '../http-service';

@Component({
  selector: 'app-inline-pass-card',
  templateUrl: './inline-pass-card.component.html',
  styleUrls: ['./inline-pass-card.component.scss']
})

export class InlinePassCardComponent implements OnInit {
  
  @Input() pass: HallPass;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 181;

  selectedDuration: number;
  selectedTravelType: string;

  constructor(private http: HttpService) { }

  ngOnInit() {
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

  endPass(){
    const endPoint:string = 'api/methacton/v1/hall_passes/' +this.pass.id +'/ended';
    this.http.post(endPoint).subscribe();
  }

}
