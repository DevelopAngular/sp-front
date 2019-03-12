import { Component, Input, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { getInnerPassContent, getInnerPassName, isBadgeVisible } from '../pass-tile/pass-display-util';
import { Util } from '../../Util';
import {filter} from 'rxjs/operators';
import { TimeService } from '../services/time.service';

@Component({
  selector: 'app-pass-cell',
  templateUrl: './pass-cell.component.html',
  styleUrls: ['./pass-cell.component.scss']
})
export class PassCellComponent implements OnInit, OnDestroy {

  @Input() mock = null;
  @Input() pass: HallPass | Invitation | Request;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() timerEvent: Subject<any>;

  timeLeft;
  valid: boolean = true;
  timers: number[] = [];

  constructor(private timeService: TimeService) {
  }

  get cellName() {
    return getInnerPassName(this.pass);
  }

  get cellContent() {
    if (this.isActive) {
      return this.timeLeft + (this.valid ? ' Remaining' : ' Expiring');
    } else {
      return this.pass instanceof Request ?
          ((this.pass.request_time && this.forFuture) ?
            (!this.forStaff ? getInnerPassContent(this.pass) : Util.formatDateTime(this.pass.request_time)) : (this.forStaff ? 'Pass for Now' : '')) :
          getInnerPassContent(this.pass, (!this.pass['request_time'] && this.pass instanceof Request) ||
              !(this.pass instanceof Invitation));
    }
  }

  get isBadgeVisible() {
    return isBadgeVisible(this.pass);
  }

  get isEnded() {
    return (this.pass instanceof HallPass) && this.pass.end_time < this.timeService.nowDate();
  }

  ngOnInit() {

    if (this.mock) {

    } else {

      this.valid = this.isActive;
      if (this.timerEvent) {
        this.timerEvent.pipe(filter(() => this.pass instanceof HallPass )).subscribe(() => {
          const end: Date = this.pass['expiration_time'];
          const now: Date = this.timeService.nowDate();
          const diff: number = (end.getTime() - now.getTime()) / 1000;
          const mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
          const secs: number = Math.abs(Math.floor(diff) % 60);
          this.valid = end > now;
          this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
        });
      }
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
