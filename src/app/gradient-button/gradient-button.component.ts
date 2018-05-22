import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface ClickEvent {
  clicked: boolean;
}

const DEFAULT_GRADIENT = 'radial-gradient(circle at 73% 71%, #03cf31, rgba(2, 169, 67, 0.86) 67%, rgba(1, 129, 85, 0.7))';

const cssNum = '(\\d+(\\.\\d+)?)';
const CSS_COLOR_REGEXP = `#[0-9a-f]{3}([0-9a-f]{3})?|rgb\\(${cssNum}, *${cssNum}, *${cssNum}\\)`;

const cssGradientRegexp = new RegExp(`^(${CSS_COLOR_REGEXP}), *(${CSS_COLOR_REGEXP})$`, 'i');

@Component({
  selector: 'app-gradient-button',
  templateUrl: './gradient-button.component.html',
  styleUrls: ['./gradient-button.component.css']
})
export class GradientButtonComponent {

  @Input() gradient: string;
  @Input() leftIcon: string;
  @Input() rightIcon: string;
  @Input() text: string;
  @Input() minWidth: number;

  constructor(private sanitizer: DomSanitizer) {
  }

  get styleGradient() {
    // We're fine using arbitrary styles here because they must match a very strict regex.

    const gradient = this.gradient ? this.gradient.trim() : '';
    if (cssGradientRegexp.test(gradient)) {
      return this.sanitizer.bypassSecurityTrustStyle('radial-gradient(circle at 73% 71%, ' + gradient + ')');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle(DEFAULT_GRADIENT);
    }
  }

}
