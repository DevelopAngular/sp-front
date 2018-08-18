import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { bumpIn } from '../animations';
import { Pinnable } from '../models/Pinnable';

@Component({
  selector: 'app-pinnable',
  templateUrl: './pinnable.component.html',
  styleUrls: ['./pinnable.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PinnableComponent implements OnInit {

  @Input()
  pinnable: Pinnable;

  @Input()
  forLater: boolean = false;

  @Input()
  forStaff: boolean = false;

  @Output() onSelectEvent: EventEmitter<Pinnable> = new EventEmitter();

  restricted: boolean = false;
  buttonDown = false;

  constructor() {

  }

  ngOnInit() {
    if (!!this.pinnable.location) {
      this.restricted = ((this.pinnable.location.restricted && !this.forLater) || (this.pinnable.location.scheduling_restricted && this.forLater));
    }
  }

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  onSelect() {
    // console.log("Pinnable Selected");
    this.onSelectEvent.emit(this.pinnable);
  }

  getGradient() {
    let gradient: string[] = this.pinnable.color_profile.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

}
