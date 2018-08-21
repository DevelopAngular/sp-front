import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { getInnerPassContent, getInnerPassName, isBadgeVisible } from '../pass-tile/pass-display-util';

@Component({
  selector: 'app-pass-cell',
  templateUrl: './pass-cell.component.html',
  styleUrls: ['./pass-cell.component.scss']
})
export class PassCellComponent implements OnInit, OnDestroy {

  @Input() pass: HallPass | Invitation | Request;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;

  timeLeft;
  valid: boolean = true;
  timers: number[] = [];

  constructor() {
  }

  get cellName() {
    return getInnerPassName(this.pass);
  }

  get cellContent() {
    return this.isActive?(this.timeLeft +(this.valid?' Remaining':' Expiring')):getInnerPassContent(this.pass);
  }

  get isBadgeVisible() {
    return isBadgeVisible(this.pass);
  }

  get isEnded() {
    return (this.pass instanceof HallPass) && this.pass.end_time < new Date();
  }

  ngOnInit() {
    this.valid = this.isActive;
    if (!!this.pass && this.isActive) {
      this.timers.push(window.setInterval(() => {
        let end: Date = this.pass['expiration_time'];
        let now: Date = new Date();
        let diff: number = (end.getTime() - now.getTime()) / 1000;
        let mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        let secs: number = Math.abs(Math.floor(diff) % 60);
        this.valid = end > now;
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
      }, 750));
    }
  }

  ngOnDestroy() {
    this.timers.forEach(id => {
      console.log('Clearing interval');
      clearInterval(id);
    });
    this.timers = [];
  }

}
