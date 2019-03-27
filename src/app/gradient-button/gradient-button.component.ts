import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { bumpIn } from '../animations';

export interface ClickEvent {
  clicked: boolean;
}

const DEFAULT_GRADIENT = 'radial-gradient(circle at 80% 67%, #03cf31, #00b476)';

const cssNum = '(\\d+(\\.\\d+)?)';
const CSS_COLOR_REGEXP = `#[0-9a-f]{3}([0-9a-f]{3})?|rgb\\(${cssNum}, *${cssNum}, *${cssNum}\\)`;

const cssGradientRegexp = new RegExp(`^(${CSS_COLOR_REGEXP}), *(${CSS_COLOR_REGEXP})$`, 'i');

const cssColorRegexp = new RegExp(`^(${CSS_COLOR_REGEXP})$`, 'i');

@Component({
  selector: 'app-gradient-button',
  templateUrl: './gradient-button.component.html',
  styleUrls: ['./gradient-button.component.scss'],
  animations: [
    bumpIn
  ]
})
export class GradientButtonComponent implements OnInit {

  /*
  * @Input 'size' can be small, medium large or editable.
  * If editable, all inputs marked as ' > editable' below can be provided, otherwise they will be overridden
  */
  @Input() size: string = 'small';

  @Input() border: string;
  @Input() gradient: string;
  @Input() hoverColor: string = '#00B476';
  @Input() leftIcon: string;
  @Input() rightIcon: string;
  @Input() text: string;
  @Input() subtitle: string;
  @Input() textColor: string;
  @Input() width: string; // > editable
  @Input() minWidth: string; // > editable
  @Input() minHeight: string; // > editable
  @Input() disabled: boolean = false;
  @Input() fontSize: string = '20px'; // > editable
  @Input() fontWeight: string = 'bold'; // > editable
  @Input() leftImageWidth: string; // > editable
  @Input() leftImageHeight: string; // > editable
  @Input() cursor: string;
  @Input() textWidth: string = '100%';
  @Input() buttonLink: string; // needs for the links so that don't brake an existing markup and the entire button is clickable
  @Input() documentType: string; // can be pdf or xslx/csv
  @Output() buttonClick = new EventEmitter<any>();

  buttonDown = false;
  hovered: boolean = false;

  constructor(private sanitizer: DomSanitizer) {
  }
  ngOnInit(): void {
    if (this.size && this.size !== 'editable') {

      this.width = 'auto';
      this.minWidth = this.width;


      switch (this.size) {
        case 'small':
          this.leftImageHeight = '16px';
          this.leftImageWidth = '16px';
          this.minHeight = '40px';
          this.fontSize = '14px'
          break;
        case 'medium':
          this.leftImageHeight = '21px';
          this.leftImageWidth = '21px';
          this.minHeight = '50px';
          this.fontSize = '15px';
          break;
        case 'large':
          this.leftImageHeight = '25px';
          this.leftImageWidth = '25px';
          this.minHeight = '60px';
          this.fontSize = '17px';
          break;
      }
    }
  }

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get styleGradient() {
    // We're fine using arbitrary styles here because they must match a very strict regex.
    if (this.buttonDown) {
      // console.log("[Hover State]: ", "Using hover styles");
      const color = this.hoverColor;
      if (cssColorRegexp.test(color)) {
        // console.log("[Color Sanitizer]: ", "Color passed");
        return this.sanitizer.bypassSecurityTrustStyle(color);
      } else {
        // console.log("[Color Sanitizer]: ", "Color did not pass");
        return this.sanitizer.bypassSecurityTrustStyle(DEFAULT_GRADIENT);
      }
    } else {
      // console.log("[Hover State]: ", "Using gradient styles");
      const gradient = this.gradient ? this.gradient.trim() : '';

      if (cssGradientRegexp.test(gradient)) {
        // console.log("[Gradient Sanitizer]: ", "Gradient passed");
        return this.sanitizer.bypassSecurityTrustStyle('radial-gradient(circle at 73% 71%, ' + gradient + ')');
      } else {
        // console.log("[Gradient Sanitizer]: ", "Gradient did not pass");
        return this.sanitizer.bypassSecurityTrustStyle(DEFAULT_GRADIENT);
      }
    }
  }

  get contentAlign(): string {
    if (this.leftIcon && !this.rightIcon) {
      return 'left';
    }

    if (this.rightIcon && !this.leftIcon) {
      return 'right';
    }

    return 'center';
  }

  get shadow() {
    return this.sanitizer.bypassSecurityTrustStyle(((this.hovered && !this.disabled) ?
        '0 2px 4px 1px rgba(0, 0, 0, 0.3)' : '0 1px 4px 0px rgba(0, 0, 0, 0.25)'));
  }

  onPress(press: boolean) {
    if(!this.disabled)
      this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

  onClick(event){
    if(!this.disabled)
      this.buttonClick.emit(event)
  }

  onHover(hover: boolean){
    this.hovered = hover;
    if(!hover)
      this.buttonDown = false;
  }

}
