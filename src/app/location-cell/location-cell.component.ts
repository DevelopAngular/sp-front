import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../models/Location';
import { HttpService } from '../services/http-service';
import { DomSanitizer } from '@angular/platform-browser';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-location-cell',
  templateUrl: './location-cell.component.html',
  styleUrls: ['./location-cell.component.scss']
})
export class LocationCellComponent implements OnInit {

  @Input()
  value: Location;

  @Input()
  type: string;

  @Input()
  starred: boolean;

  @Input()
  showStar: boolean;

  @Input()
  forStaff: boolean;

  @Input()
  forLater: boolean;

  @Input()
  hasLocks: boolean = false;

  @Input()
  valid: boolean = true;

  @Input()
  allowOnStar: boolean = false;

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<any> = new EventEmitter();

  overStar: boolean = false;
  hovered: boolean;
  pressed: boolean;

  constructor(
    private http: HttpService,
    private sanitizer: DomSanitizer,
    private darkTheme: DarkThemeSwitch
  ) {}

  get showLock(){
    return !this.forStaff && ((this.value.restricted && !this.forLater) || (this.value.scheduling_restricted && this.forLater));
  }

  get cursor(){
    return this.valid?'pointer':'not-allowed';
  }

  get bgColor(){
    if (this.valid) {
      if (this.hovered) {
        if (this.pressed) {
          return this.sanitizer.bypassSecurityTrustStyle('#E2E7F4');
        } else {
          return this.sanitizer.bypassSecurityTrustStyle('#ECF1FF');
        }
      } else {
        return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
      }
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
    }
  }

  get textColor() {
    if (this.valid) {
      if (this.hovered) {
        return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      }
    } else {
       return this.sanitizer.bypassSecurityTrustStyle('#CDCDCE');
    }
  }

  get roomColor() {
    if (this.valid) {
      if (this.hovered) {
        return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      }
    } else {
       return this.sanitizer.bypassSecurityTrustStyle('#CDCDCE');
    }
  }

  ngOnInit() {
    this.value.starred = this.starred;
  }

  cellSelected() {
    if (this.valid) {
      this.onSelect.emit(this.value);
      if (this.allowOnStar) {
        this.star();
      }
    }
  }

  star() {
    this.value.starred = !this.value.starred;
    this.onStar.emit(this.value);
  }

}
