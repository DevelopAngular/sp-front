import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {bumpIn} from '../animations';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-xs-button',
  templateUrl: './xs-button.component.html',
  styleUrls: ['./xs-button.component.scss'],
  animations: [bumpIn]
})
export class XsButtonComponent implements OnInit {

  @Input() length: number;
  @Input() placeholder: string;
  @Input() selectedText: string;

  @Output() open: EventEmitter<string> = new EventEmitter<string>();
  @Output() reset: EventEmitter<boolean> = new EventEmitter<boolean>();

  buttonDown: boolean;
  hovered: boolean;

  constructor(private sanitizer: DomSanitizer) { }

  get buttonState() {
      return this.buttonDown ? 'down' : 'up';
  }

  get shadow() {
    return this.sanitizer.bypassSecurityTrustStyle(((this.hovered && !this.buttonDown) ?
        '0px 3px 10px rgba(228, 140, 21, 0.2)' : '0px 3px 5px rgba(0, 0, 0, 0.1)'));
  }

  ngOnInit() {
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

  openEmit() {
    this.open.emit(this.placeholder);
  }

  resetEmit() {
    this.reset.emit(true);
  }

}
