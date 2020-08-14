import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-filter-button',
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.scss'],
})
export class FilterButtonComponent implements OnInit {

  @Input() title: string;
  @Input() filter: boolean;
  @Input() showClearIcon: boolean = true;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearData: EventEmitter<any> = new EventEmitter<any>();

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  background(hover, pressed) {
    if (hover) {
      if (this.filter) {
        return this.domSanitizer.bypassSecurityTrustStyle('rgba(223, 230, 250)');
      } else {
        if (pressed) {
          return this.domSanitizer.bypassSecurityTrustStyle('rgba(127, 135, 157, .15)');
        } else {
          return this.domSanitizer.bypassSecurityTrustStyle('rgba(127, 135, 157, .1)');
        }
      }
    } else {
      if (this.filter) {
        return this.domSanitizer.bypassSecurityTrustStyle('rgba(236, 241, 255)');
      }
    }
  }

  clear(event) {
    event.stopPropagation();
    this.clearData.emit();
  }

}
