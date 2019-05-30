import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {
  @Input() allowDarkTheme: boolean = true;
  @Input() autoSizing: boolean = true;
  @Input() topSpace: string = '20px';
  @Output()
  click: EventEmitter<any> = new EventEmitter();

  hovered: boolean;
  pressed: boolean;

  constructor(
    public darkTheme: DarkThemeSwitch,
    private sanitizer: DomSanitizer,
  ) { }

  get bgColor() {
      if (this.hovered) {
        if (this.pressed) {
          return this.sanitizer.bypassSecurityTrustStyle(this.darkTheme.isEnabled$.value && this.allowDarkTheme ? '#139BEB' : '#E2E7F4');
        } else {
          return this.sanitizer.bypassSecurityTrustStyle(this.darkTheme.isEnabled$.value && this.allowDarkTheme ? '#0B72EB' : '#ECF1FF');
        }
      } else {
        return this.sanitizer.bypassSecurityTrustStyle('transparent');
      }
  }

  get _class() {
    if (this.autoSizing) {

      return {
        'back-wrapper-auto': !this.darkTheme.isEnabled$.value,
        'back-wrapper-auto__dark': this.darkTheme.isEnabled$.value
      };
    } else {

      return {
        'back-wrapper': !this.darkTheme.isEnabled$.value,
        'back-wrapper__dark': this.darkTheme.isEnabled$.value
      };
    }
  }

  ngOnInit() {
  }

}
