import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColorProfile } from '../../../models/ColorProfile';
import { bumpIn } from '../../../animations';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
  animations: [bumpIn]
})
export class ColorComponent implements OnInit {

  @Input() color: ColorProfile;
  @Input() selected: boolean;
  @Input() currentColor: ColorProfile;

  @Output() selectedColor: EventEmitter<ColorProfile> = new EventEmitter();

  buttonDown: boolean = false;
  hovered: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  get buttonState() {
     return this.buttonDown ? 'down' : 'up';
  }

  get shadow() {
     if (this.hovered) {
       if (this.selected) {
         return this.sanitizer.bypassSecurityTrustStyle('0px 0px 30px ' + this.color.solid_color);
       } else {
         return this.sanitizer.bypassSecurityTrustStyle('0 2px 4px 1px rgba(0, 0, 0, 0.3)');
       }
     } else {
       if (this.selected) {
         return this.sanitizer.bypassSecurityTrustStyle('0px 0px 20px ' + this.color.solid_color);
       }
       return this.sanitizer.bypassSecurityTrustStyle('0 2px 4px 0px rgba(0, 0, 0, 0.1)');
     }
  }

  ngOnInit() {}

  changeColor() {
    this.selectedColor.emit(this.color);
  }

  onPress(press: boolean) {
     this.buttonDown = press;
  }

  onHover(hover: boolean){
    this.hovered = hover;
    if (!hover) {
       this.buttonDown = false;
    }
  }

}
