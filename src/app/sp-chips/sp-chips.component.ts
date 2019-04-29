import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {User} from '../models/User';

@Component({
  selector: 'app-sp-chips',
  templateUrl: './sp-chips.component.html',
  styleUrls: ['./sp-chips.component.scss']
})
export class SpChipsComponent implements OnInit {

  @Input() selectedProfiles: User[] = [];

  @Output() add: EventEmitter<boolean> = new EventEmitter();
  @Output() updateSelectedEvent: EventEmitter<User[]> = new EventEmitter();

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    console.log(this.selectedProfiles);
  }
  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  getBackground(item) {
    if (item.hovered) {
      return '#F7F7F7';
    } else {
      return '#F7F7F7';
    }
  }
}
