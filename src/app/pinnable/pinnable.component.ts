import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { bumpIn } from '../animations';
import { Pinnable } from '../models/Pinnable';
import { DomSanitizer } from '../../../node_modules/@angular/platform-browser';

@Component({
  selector: 'app-pinnable',
  templateUrl: './pinnable.component.html',
  styleUrls: ['./pinnable.component.scss'],
  animations: [
    bumpIn
  ]
})
export class PinnableComponent implements OnInit {

  @Input() mock = null;

  @Input()
  pinnable: Pinnable;

  @Input()
  width: string = '120px';

  @Input()
  height: string = '70px';

  @Input()
  iconWidth: string = '30px';

  @Input()
  forLater: boolean = false;

  @Input()
  forStaff: boolean = false;

  @Input()
  forCollection: boolean = false;

  @Input()
  forBulk: boolean = false;

  @Input()
  valid: boolean = true;

  @Input()
  selected: boolean = false;

  @Input() disabled: boolean = false;

  @Output()
  onSelectEvent: EventEmitter<Pinnable> = new EventEmitter();

  restricted: boolean = false;
  buttonDown = false;
  hovered: boolean;

  constructor(private sanitizer: DomSanitizer) {

  }

  get shadow(){
    if(this.hovered && this.valid && !this.disabled)
      return this.sanitizer.bypassSecurityTrustStyle('0 2px 4px 1px rgba(0, 0, 0, 0.3)');
    else
      return this.sanitizer.bypassSecurityTrustStyle('0 2px 4px 0px rgba(0, 0, 0, 0.1)');
  }

  ngOnInit() {

    if (!this.mock) {
      if (!!this.pinnable.location) {
        this.restricted = ((this.pinnable.location.restricted && !this.forLater) || (this.pinnable.location.scheduling_restricted && this.forLater));
      }

    } else {

    }
  }

  get buttonState() {
    return this.valid && !this.disabled ? this.buttonDown ? 'down' : 'up' : 'up';
  }

  onSelect() {
    if (this.valid && !this.disabled)
      this.onSelectEvent.emit(this.pinnable);
  }

  getGradient() {
    if (this.buttonDown) {
      return this.pinnable.color_profile.pressed_color;
    } else {
      const gradient: string[] = this.pinnable.color_profile.gradient_color.split(',');
      return this.sanitizer.bypassSecurityTrustStyle('radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')');
    }
  }

  onPress(press: boolean) {
    if (!this.disabled) {
      this.buttonDown = press;
    }
  }

}
