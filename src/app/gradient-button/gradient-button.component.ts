import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { bumpIn } from '../animations';
import {ScreenService} from '../services/screen.service';

export interface ClickEvent {
  clicked: boolean;
}

const DEFAULT_GRADIENT = 'radial-gradient(circle at 80% 67%, #03cf31, #00b476)';

const cssNum = '(\\d+(\\.\\d+)?)';
const CSS_COLOR_REGEXP = `#[0-9a-f]{3}([0-9a-f]{3})?|rgb\\(${cssNum}, *${cssNum}, *${cssNum}\\)`;

const cssGradientRegexp = new RegExp(`^(${CSS_COLOR_REGEXP}), *(${CSS_COLOR_REGEXP})$`, 'i');

const cssColorRegexp = new RegExp(`^(${CSS_COLOR_REGEXP})$`, 'i');


type buttonSize = 'small' | 'medium' | 'large' | 'xl' | 'editable';

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
  @Input() fontWeight: string = 'bold'; // > editable
  @Input() leftImageWidth: string; // > editable
  @Input() leftImageHeight: string; // > editable
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
  @Output() buttonClick = new EventEmitter<any>();

  buttonDown = false;
  hovered: boolean = false;

  constructor(private sanitizer: DomSanitizer, private screenService: ScreenService) {
  }
  ngOnInit(): void {
    // if (this.size && this.size !== 'small' && this.size !== 'medium' && this.size !== 'large' && this.size !== 'xl') {
    //   this.size = 'small';
    // }
    if (this.size && this.size !== 'editable') {

      this.width = 'auto';
      this.minWidth = this.width;


      switch (this.size) {
        case 'small':
          this.leftImageHeight = '16px';
          this.leftImageWidth = '16px';
          this.minHeight = '40px';
          this.minWidth = '100px';
          this.fontSize = '14px';
          this.fontWeight = 'bold';
          this.cornerRadius = '8px';
          this.padding = '0px 16px';
          break;
        case 'medium':
          this.leftImageHeight = '21px';
          this.leftImageWidth = '21px';
          this.minHeight = '50px';
          this.minWidth = '100px';
          this.fontSize = '15px';
          this.fontWeight = 'bold';
          this.cornerRadius = '8px';
          this.padding = '0px 16px';

          break;
        case 'large':
          this.leftImageHeight = '21px';
          this.leftImageWidth = '21px';
          this.minHeight = '75px';
          this.minWidth = '120px';
          this.fontSize = '17px';
          this.fontWeight = 'bold';
          this.cornerRadius = '10px';
          this.padding = '0px 20px';

          break;
        case 'xl':
          this.leftImageHeight = '34px';
          this.leftImageWidth = '34px';
          this.minHeight = '100px';
          this.minWidth = '160px';
          this.fontSize = '22px';
          this.fontWeight = 'bold';
          this.cornerRadius = '12px';
          this.padding = '0px 20px';

          break;
      }
    }
  }

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get styleGradient() {
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
        const lastEqualSignIndex = this.gradient.lastIndexOf(',');
        const gg = this.gradient.substr(lastEqualSignIndex + 1);
        // console.log(gg);
        return gg;
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
      return this.sanitizer.bypassSecurityTrustStyle(((this.hovered && !this.disabled && !this.buttonDown) ?
          '0px 3px 10px rgba(228, 140, 21, 0.2)' : '0px 3px 5px rgba(0, 0, 0, 0.1)'));
    } else {
      return 'none';
    }
  }

  onPress(press: boolean, event) {
    if (this.screenService.isDeviceLargeExtra) event.preventDefault();
    if(!this.disabled)
      this.buttonDown = press;
    //console.log("[Button State]: ", "The button is " +this.buttonState);
  }

  onTap(tap: boolean) {
    // if(!this.disabled)
      this.buttonDown = tap;

    // console.log(this.buttonDown);
  }

  onClick(event) {
    if(!this.disabled) {

      this.buttonClick.emit(event)
    } else {
      return;
    }
  }

  onHover(hover: boolean){
    this.hovered = hover;
    if(!hover)
      this.buttonDown = false;
  }

}
