import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../models/Location';
import { HttpService } from '../services/http-service';
import { DomSanitizer } from '../../../node_modules/@angular/platform-browser';

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

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onStar: EventEmitter<any> = new EventEmitter();

  overStar: boolean = false;
  hovered: boolean;

  constructor(private http: HttpService, private sanitizer: DomSanitizer) {}

  get showLock(){
    return !this.forStaff && ((this.value.restricted && !this.forLater) || (this.value.scheduling_restricted && this.forLater));
  }

  get cursor(){
    return this.valid?'pointer':'not-allowed';
  }

  get bgColor(){
    if(this.valid){
      if(this.hovered)
        return this.sanitizer.bypassSecurityTrustStyle('#F1F1F1');
      else
        return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
    }else{
      return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
    }
  }

  get textColor(){
    if (this.valid) {
      if (this.hovered) {
        return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#555558');
      }
    } else {
       return this.sanitizer.bypassSecurityTrustStyle('#CDCDCE');
    }
  }

  get roomColor(){
    if (this.valid) {
      if (this.hovered) {
        return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
      } else {
          return this.sanitizer.bypassSecurityTrustStyle('#B5B5B5');
      }
    } else {
       return this.sanitizer.bypassSecurityTrustStyle('#CDCDCE');
    }
  }

  ngOnInit() {
    this.value.starred = this.starred;
  }

  cellSelected() {
    if(!this.overStar && this.valid)
      this.onSelect.emit(this.value);
  }

  star(){
    this.value.starred = !this.value.starred;
    this.onStar.emit(this.value);
  }

}
