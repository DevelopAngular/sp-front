import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'events';
import { bumpIn } from '../animations';
import { PassLike } from '../models';
import { getInnerPassContent, getInnerPassName, isBadgeVisible } from './pass-display-util';

@Component({
  selector: 'app-pass-tile',
  templateUrl: './pass-tile.component.html',
  styleUrls: ['./pass-tile.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PassTileComponent implements OnInit {

  @Input() pass: PassLike;
  @Input() fromPast = false;
  @Input() forFuture = false;
  @Input() isActive = false;
  @Input() forStaff = false;

  @Output() tileSelected = new EventEmitter();

  buttonDown = false;
  timeLeft;
  valid: boolean = true;

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get tileContent() {
    return this.valid?(this.timeLeft +' Remaining'):getInnerPassContent(this.pass);
  }

  get tileName() {
    return getInnerPassName(this.pass);
  }

  get isBadgeVisible() {
    return isBadgeVisible(this.pass);
  }

  constructor() {
  }

  ngOnInit() {
    this.valid = this.isActive;
    setInterval(() => {
      if (!!this.pass && this.valid) {
        let end: Date = this.pass['expiration_time'];
        let now: Date = new Date();
        let diff: number = (end.getTime() - now.getTime()) / 1000;
        let mins: number = Math.floor(Math.abs(Math.floor(diff) / 60));
        let secs: number = Math.abs(Math.floor(diff) % 60);
        this.valid = end > now;
        this.timeLeft = mins + ':' + (secs < 10 ? '0' + secs : secs);
      }
    }, 10);
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
