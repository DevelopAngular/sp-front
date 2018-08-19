import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '../models/Location';
import { HttpService } from '../http-service';
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

  get bgColor(){
    if(this.valid){
      if(this.hovered)
        return this.sanitizer.bypassSecurityTrustStyle('#F1F1F1');
      else
        return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
    }else{
      return this.sanitizer.bypassSecurityTrustStyle('#767676');
    }
  }

  get textColor(){
    if(this.valid)
      return this.sanitizer.bypassSecurityTrustStyle('#767676');
    else
      return this.sanitizer.bypassSecurityTrustStyle('#FFFFFF');
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
