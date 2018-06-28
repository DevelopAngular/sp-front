import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { bumpIn } from '../animations';
import { Pinnable } from '../NewModels';

@Component({
  selector: 'app-pinnable',
  templateUrl: './pinnable.component.html',
  styleUrls: ['./pinnable.component.css'],
  animations: [
    bumpIn
  ]
})
export class PinnableComponent implements OnInit {

  @Input()
  pinnable: Pinnable;

  @Output() onSelectEvent: EventEmitter<Pinnable> = new EventEmitter();

  restricted: boolean = false;
  buttonDown = false;

  constructor() {

  }

  ngOnInit() {
    if (!!this.pinnable.location) {
      this.restricted = this.pinnable.location.restricted;
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
    let gradient: string[] = this.pinnable.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

}
