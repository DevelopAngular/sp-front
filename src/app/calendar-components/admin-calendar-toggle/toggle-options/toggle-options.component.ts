import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-toggle-options',
  templateUrl: './toggle-options.component.html',
  styleUrls: ['./toggle-options.component.scss']
})
export class ToggleOptionsComponent implements OnInit {

  @Input() options;
  @Input() selectedId;

  @Output() result = new EventEmitter<any>();

  constructor(private sanitizer: DomSanitizer) { }

  textColor(item) {
      if (this.selectedId === item.id) {
          return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#7F879D');
      }
  }

  getBackground(item, option) {
    if (item.hovered) {
      if (!item.pressed) {
        return this.sanitizer.bypassSecurityTrustStyle('rgba(127, 135, 157, .1)');
      } else {
        return this.sanitizer.bypassSecurityTrustStyle('rgba(127, 135, 157, .15)');
      }
    } else {
      if (this.selectedId === option.id) {
        return this.sanitizer.bypassSecurityTrustStyle('#ECF1FF');
      } else {
        return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
      }
    }
  }

  ngOnInit() {
    if (this.selectedId) {
        this.result.emit(this.selectedId);
    }
  }

  selectedOptions(id) {
    this.selectedId = id;
    this.result.emit(this.selectedId);
  }

}
