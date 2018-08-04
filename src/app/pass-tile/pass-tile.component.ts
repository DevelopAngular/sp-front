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

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get tileContent() {
    return getInnerPassContent(this.pass);
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
