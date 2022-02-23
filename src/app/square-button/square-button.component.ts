import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../animations';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-square-button',
  templateUrl: './square-button.component.html',
  styleUrls: ['./square-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    bumpIn
  ]
})
export class SquareButtonComponent implements OnInit {

  @Input() width: string = '50px';
  @Input() height: string = '50px';
  @Input() backgroundColor: string = '#00B476';
  @Input() disabled: boolean = false;
  @Input() withShadow: boolean = true;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter();

  buttonDown: boolean;
  hovered: boolean;

  constructor(private sanitizer: DomSanitizer) { }

  get buttonState() {
    return this.buttonDown ? 'down' : 'up';
  }

  get shadow() {
    if (this.withShadow) {
      let i = 0;
      const hexColors = [];
      const color = this.backgroundColor;
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

  ngOnInit(): void {
  }

  onClick(event) {
    this.buttonClick.emit(event);
  }

  onHover(hover: boolean) {
    this.hovered = hover;
    if (!hover) {
      this.buttonDown = false;
    }
  }

}
