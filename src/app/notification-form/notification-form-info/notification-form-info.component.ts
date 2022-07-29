import { Component, OnInit, Input } from '@angular/core';

type NotificationInfoStyle = 'normal' | 'warn' | 'disabled';

@Component({
  selector: 'app-notification-form-info',
  templateUrl: './notification-form-info.component.html',
  styleUrls: ['./notification-form-info.component.scss']
})
export class NotificationFormInfoComponent implements OnInit {

  @Input() image: string = null;
  @Input() style: NotificationInfoStyle = 'normal';
  @Input() iconBackground = '#7083A0';

  dropped = false;
  constructor() { }

  ngOnInit(): void {
  }

  get classes() {
    return {normal: this.style === 'normal', warn: this.style === 'warn', disabled: this.style === 'disabled'};
  }

  showImage() {
    return !!this.image;
  }

  toggleDropdown() {
    this.dropped = !this.dropped;
  }

  dropdownImage() {
    if (this.dropped) {
      return './assets/Dropdown Up (Gray).svg';
    } else {
      return './assets/Dropdown (Gray).svg';
    }
  }

}
