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
      if (item.hovered) {
          return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#555558');
      }
  }

  getBackground(item) {
      if (item.hovered) {
          if (item.pressed) {
              return '#E2E7F4';
          } else {
              return '#ECF1FF';
          }
      } else {
          return '#FFFFFF';
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
