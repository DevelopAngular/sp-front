import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-filter-button',
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.scss'],
})
export class FilterButtonComponent implements OnInit {

  @Input() title: string;
  @Input() filter: boolean;
  @Input() showClearIcon: boolean = true;
  @Input() forceButtonClick$: Subject<any>;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() forceButtonClickEvent: EventEmitter<{event: any, action: string}> = new EventEmitter<{event: any, action: string}>();
  @Output() clearData: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('button', { static: true }) button: ElementRef;

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.forceButtonClick$) {
      this.forceButtonClick$.subscribe(res => {
        this.forceButtonClickEvent.emit({event: this.button.nativeElement, action: res});
      });
    }
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
