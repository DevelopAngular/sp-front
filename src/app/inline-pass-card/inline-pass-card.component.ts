import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { HallPass} from '../models/HallPass';
import { HttpService } from '../services/http-service';
import { DataService } from '../services/data-service';
import { interval, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {ApiService} from '../services/api.service';

@Component({
  selector: 'app-inline-pass-card',
  templateUrl: './inline-pass-card.component.html',
  styleUrls: ['./inline-pass-card.component.scss']
})

export class InlinePassCardComponent implements OnInit, OnDestroy {

  @Input() pass: HallPass;
  @Input() isActive: boolean = false;
  @Input() forInput: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forFuture: boolean = false;

  timeLeft: string = '';
  valid: boolean = true;
  returnData: any = {};
  overlayWidth: number = 0;
  buttonWidth: number = 288;

  selectedDuration: number;
  selectedTravelType: string;
  performingAction: boolean;
  subscribers$;

  constructor(private http: HttpService, private dataService: DataService, private apiService: ApiService) { }

  ngOnInit() {
      this.subscribers$ = merge(of(0), interval(1000)).pipe(map(x => {
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
              this.overlayWidth = (this.buttonWidth * (diff / dur));
              return x;
          }
      })).subscribe();
  }

  ngOnDestroy() {
    this.subscribers$.unsubscribe();
  }

  endPass(){
    // console.log('END PASS ===>', this.pass);
    this.performingAction = true;
    this.apiService.endPass(this.pass.id).subscribe(res => {
      this.dataService.isActivePass$.next(false);
    });
  }

}
