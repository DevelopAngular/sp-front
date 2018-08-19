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

  @Input()
  pinnable: Pinnable;

  @Input()
  forLater: boolean = false;

  @Input()
  forStaff: boolean = false;

  @Input()
  valid: boolean = true;

  @Output() onSelectEvent: EventEmitter<Pinnable> = new EventEmitter();

  restricted: boolean = false;
  buttonDown = false;
  hovered: boolean;

  constructor(private sanitizer: DomSanitizer) {

  }

  get shadow(){
    if(this.hovered && this.valid)
      return this.sanitizer.bypassSecurityTrustStyle('0 2px 4px 1px rgba(0, 0, 0, 0.3)');
    else
      return this.sanitizer.bypassSecurityTrustStyle('0 2px 4px 0px rgba(0, 0, 0, 0.1)');
  }

  ngOnInit() {
    if (!!this.pinnable.location) {
      this.restricted = ((this.pinnable.location.restricted && !this.forLater) || (this.pinnable.location.scheduling_restricted && this.forLater));
    }
  }

  get buttonState() {
    return this.valid?this.buttonDown ? 'down' : 'up':'up';
  }

  onSelect() {
    // console.log("Pinnable Selected");
    if(this.valid)
      this.onSelectEvent.emit(this.pinnable);
  }

  getGradient() {
    if(this.valid){
      let gradient: string[] = this.pinnable.color_profile.gradient_color.split(',');
      return this.sanitizer.bypassSecurityTrustStyle('radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')');
    } else{
      return this.sanitizer.bypassSecurityTrustStyle('radial-gradient(circle at 73% 71%, rgb(203, 213, 229), rgb(203, 213, 229))');
    }
  }

  onPress(press: boolean) {
    this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

}
