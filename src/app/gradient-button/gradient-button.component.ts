import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {bumpIn} from '../animations';

export interface ClickEvent {
  clicked: boolean;
}

const DEFAULT_GRADIENT = 'radial-gradient(circle at 80% 67%, #03cf31, #00b476)';

const cssNum = '(\\d+(\\.\\d+)?)';
const CSS_COLOR_REGEXP = `#[0-9a-f]{3}([0-9a-f]{3})?|rgb\\(${cssNum}, *${cssNum}, *${cssNum}\\)`;

const cssGradientRegexp = new RegExp(`^(${CSS_COLOR_REGEXP}), *(${CSS_COLOR_REGEXP})$`, 'i');

const cssColorRegexp = new RegExp(`^(${CSS_COLOR_REGEXP})$`, 'i');


type buttonSize = 'tiny' | 'small' | 'medium' | 'large' | 'xl' | 'editable';

type docType = 'pdf' | 'xslx' | 'csv';

type linkType = '_blank' | '_self';

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
  * @Input 'size' can be small, medium, large, xl or editable.
  * If editable, all inputs marked as ' > editable' below can be provided, otherwise they will be overridden
  */
  @Input() size: buttonSize = 'small';

  @Input() border: string;
  @Input() withShadow: boolean = true;
  @Input() gradient: string;
  @Input() hoverColor: string = '#00B476';
  @Input() leftIcon: string;
  @Input() rightIcon: string;
  @Input() text: string = 'PDF';
  @Input() subtitle: string;
  @Input() textColor: string;
  @Input() disabled: boolean = false;
  @Input() width: string = 'auto'; // > editable
  @Input() minWidth: string = 'auto'; // > editable
  @Input() minHeight: string; // > editable
  @Input() fontSize: string = '20px'; // > editable
  @Input() fontWeight: string = '500'; // > editable
  @Input() leftImageWidth: string = '25px'; // > editable
  @Input() leftImageHeight: string = '25px'; // > editable
  @Input() rightIconWidth: string = '25px'; // > editable
  @Input() rightIconHeight: string = '25px'; // > editable
  @Input() cursor: string = 'pointer';
  @Input() cornerRadius: string;
  @Input() padding: string;
  @Input() textWidth: string = '100%';
  @Input() whiteSpace: string = 'nowrap';
  @Input() buttonLink: string; // needs for the links so that don't brake an existing markup and the entire button is clickable
  @Input() linkType: linkType = '_blank';
  @Input() download: boolean = false;
  @Input() documentType: docType;
  @Input() isGradient: boolean;
  @Input() customBackground: string = '';
  @Output() buttonClick = new EventEmitter<any>();
  @Output() disabledButtonClick = new EventEmitter<any>();


  buttonDown = false;
  hovered: boolean = false;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

    if (this.size && this.size !== 'editable') {

      this.width = 'auto';
      this.minWidth = this.width;

      switch (this.size) {
        case 'tiny':
          this.leftImageHeight = '12px';
          this.leftImageWidth = '12px';
          this.rightIconWidth = '12px';
          this.rightIconHeight = '12px';
          this.minHeight = '30px';
          this.minWidth = '75px';
          this.fontSize = '14px';
          this.cornerRadius = '4px';
          this.padding = '0px 12px';
          break;
        case 'small':
          this.leftImageHeight = '16px';
          this.leftImageWidth = '16px';
          this.minHeight = '40px';
          this.minWidth = '100px';
          this.fontSize = '14px';
          // this.fontWeight = 'bold';
          this.cornerRadius = '8px';
          this.padding = '0px 16px';
          break;
        case 'medium':
          this.leftImageHeight = '21px';
          this.leftImageWidth = '21px';
          this.minHeight = '50px';
          this.minWidth = '100px';
          this.fontSize = '15px';
          // this.fontWeight = 'bold';
          this.cornerRadius = '8px';
          this.padding = '0px 16px';

          break;
        case 'large':
          this.leftImageHeight = '21px';
          this.leftImageWidth = '21px';
          this.minHeight = '75px';
          this.minWidth = '120px';
          this.fontSize = '17px';
          // this.fontWeight = 'bold';
          this.cornerRadius = '10px';
          this.padding = '0px 20px';

          break;
        case 'xl':
          this.leftImageHeight = '34px';
          this.leftImageWidth = '34px';
          this.minHeight = '100px';
          this.minWidth = '160px';
          this.fontSize = '22px';
          // this.fontWeight = 'bold';
          this.cornerRadius = '12px';
          this.padding = '0px 20px';

          break;
      }
    }
    if (this.buttonLink) {
      this.rightIcon = this.rightIcon === null ? './assets/External Link (White).svg' : this.rightIcon;
    }
  }

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get bg() {
    if (this.hovered) {
      if (this.buttonDown) {
        return '#E2E6EC';// gray200
      }
      return '#EAEDF1';// gray150
    }
    return this.styleGradient;
  }

  get styleGradient() {
    if(this.customBackground.length != 0)
      return this.customBackground;

    // We're fine using arbitrary styles here because they must match a very strict regex.
    if (this.isGradient) {
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
    } else {
      if (!this.gradient) {
          return this.sanitizer.bypassSecurityTrustStyle('#00B476');
      } else {
        const lastIndex = this.gradient.lastIndexOf(',');
        const color = this.gradient.substr(lastIndex + 1);
        return color;
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
    if (this.withShadow) {
        let i = 0;
        const hexColors = [];
        const gradient = this.gradient ? this.gradient : '#04CD33, #04CD33';
        const lastIndex = gradient.lastIndexOf(' ');
        const color = gradient.substr(lastIndex + 1);
        const rawHex = color.slice(1);
        do {
            hexColors.push(rawHex.slice(i, i + 2));
            i += 2;
        } while (i < rawHex.length);
        const rgbString = hexColors.map(c => parseInt(c, 16)).join(', ');
        return this.sanitizer.bypassSecurityTrustStyle(this.hovered ?
            `0px 1px 10px rgba(${rgbString}, 0.2)` : `0px 1px 10px rgba(${rgbString}, 0.1)`);
    } else {
      return 'none';
    }
  }

  // onPress(press: boolean, event) {
  //   if (this.screenService.isDeviceLargeExtra) {
  //     event.preventDefault();
  //   }
  //   if (!this.disabled) {
  //     this.buttonDown = press;
  //   }
  // }

  // onTap(tap: boolean) {
  //   // if(!this.disabled)
  //     this.buttonDown = tap;
  //
  //   // console.log(this.buttonDown);
  // }

  onClick(event) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    } else {
      this.disabledButtonClick.emit(event);
    }
  }

  onHover(hover: boolean){
    this.hovered = hover;
    if (!hover) {
      this.buttonDown = false;
    }
  }

}
