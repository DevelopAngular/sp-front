import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {bumpIn} from '../../animations';

@Component({
  selector: 'app-create-pass-button',
  templateUrl: './create-pass-button.component.html',
  styleUrls: ['./create-pass-button.component.scss'],
  animations: [bumpIn]
})
export class CreatePassButtonComponent implements OnInit {

  @Input() title: string;
  @Input() gradient: string;
  @Input() disabled: boolean;

  @Output() onClick: EventEmitter<any> = new EventEmitter();

  buttonDown: boolean;
  hovered: boolean;

  solid_color = '#00B476';

  constructor(private sanitizer: DomSanitizer) { }

  get buttonState() {
      return this.buttonDown && !this.disabled ? 'down' : 'up';
  }

  get boxShadow() {
      let i = 0;
      const hexColors = [];
      const rawHex = this.solid_color.slice(1);
      do {
          hexColors.push(rawHex.slice(i, i + 2));
          i += 2;
      } while (i < rawHex.length);
      const rgbString = hexColors.map(color => parseInt(color, 16)).join(', ');
      return this.sanitizer.bypassSecurityTrustStyle(this.hovered ?
          `0px 3px 10px rgba(${rgbString}, 0.3)` :
          this.buttonDown ? `0px 3px 5px rgba(${rgbString}, 0.15)` : '0px 3px 5px rgba(0, 0, 0, 0.1)');
  }

  ngOnInit() {
  }

  backgroundGradient() {
      if (this.buttonDown && !this.disabled) {
          return this.solid_color;
      } else {
          return 'radial-gradient(circle at 73% 71%, #03cf31, #00b476)';
      }
  }

  buttonClick(event?) {
    if (!this.disabled) {
          this.onClick.emit();
      }
    if (event) {
      event.preventDefault();
    }
  }

}
