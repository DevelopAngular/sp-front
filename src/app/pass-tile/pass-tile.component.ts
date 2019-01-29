import { Component, Input, OnInit, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { bumpIn } from '../animations';
import { PassLike } from '../models';
import { getInnerPassContent, getInnerPassName, isBadgeVisible } from './pass-display-util';
import { DomSanitizer } from '@angular/platform-browser';
import { Request } from '../models/Request';
import { Invitation } from '../models/Invitation';
import { Util } from '../../Util';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-pass-tile',
  templateUrl: './pass-tile.component.html',
  styleUrls: ['./pass-tile.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PassTileComponent implements OnInit, OnDestroy {

  @Input() mock = null;
  @Input() pass: PassLike;
  @Input() fromPast = false;
  @Input() forFuture;
  @Input() isActive = false;
  @Input() forStaff = false;
  @Input() timerEvent: Subject<any>;

  @Output() tileSelected = new EventEmitter();

  buttonDown = false;
  timeLeft = '--:--';
  valid: boolean = true;
  hovered: boolean;
  timers: number[] = [];
  //
  // mockData = {
  //   headers: [
  //     'Counselor',
  //     'Gardner',
  //     'Bathroom'
  //   ],
  //   gradients: [
  //     '#E38314,#EAB219',
  //     '#F52B4F,#F37426',
  //     '#5C4AE3,#336DE4'
  //   ],
  //   dates: [
  //     'Tomorrow, 9:03 AM',
  //     'Sept 29, 11:35 AM',
  //     'Today, 8:35 AM'
  //   ]
  // };

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get tileContent() {
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

  get tileName() {
    return getInnerPassName(this.pass);
  }

  get isBadgeVisible() {
    return isBadgeVisible(this.pass);
  }

  get boxShadow(){
    return this.sanitizer.bypassSecurityTrustStyle(this.hovered?'0 2px 4px 1px rgba(0, 0, 0, 0.3)':'0 2px 4px 0px rgba(0, 0, 0, 0.1)');
  }

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {

    if (this.mock) {

      // this.pass = null;
      // this.fromPast = false;
      // this.forFuture = true;
      // this.isActive = false;
      // this.forStaff = false;
      // this.timerEvent = new Subject<any>();
    }

    this.valid = this.isActive;
    if (this.timerEvent) {
      this.timerEvent.pipe(filter(() => !!this.pass['expiration_time'])).subscribe(() => {
        let end: Date = this.pass['expiration_time'];
        let now: Date = new Date();
        let diff: number = (end.getTime() - now.getTime()) / 1000;
        let mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        let secs: number = Math.abs(Math.floor(diff) % 60);
        this.valid = end > now;
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
      });
    }
  }

  ngOnDestroy() {
    this.timers.forEach(id => {
      console.log('Clearing interval');
      clearInterval(id);
    });
    this.timers = [];
  }

  backgroundGradient() {
    if (this.buttonDown) {
      return this.pass.color_profile.pressed_color;
    } else {
      const gradient: string[] = this.pass.color_profile.gradient_color.split(',');
      return 'radial-gradient(circle at 73% 71%, ' + (gradient[0]) + ', ' + gradient[1] + ')';
    }
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    // console.log("[Button State]: ", "The button is " +this.buttonState);
  }

  onClick(event) {
    this.tileSelected.emit(event);
  }

}
