import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-filter-button',
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.scss']
})
export class FilterButtonComponent implements OnInit {

  @Input() title: string;
  @Input() filter: boolean;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

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
    }
  }

}
