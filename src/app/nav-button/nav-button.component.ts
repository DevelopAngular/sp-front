import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {bumpIn} from '../animations';
import {DeviceDetection} from '../device-detection.helper';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss'],
  animations: [bumpIn]
})
export class NavButtonComponent implements OnInit {

  @Input() icon: string;
  @Input() content: string;
  @Input() selected: boolean = false;

  @Output() onClick: EventEmitter<any> = new EventEmitter();

  iconId: string;
  isDark;

  constructor(
    public darkTheme: DarkThemeSwitch
  ) { }


  get textColor() {
      return this.selected ? '#00B476' : this.darkTheme.isEnabled$.value ? '#FFFFFF' : ' #7E879D';
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  ngOnInit() {
    this.darkTheme.isEnabled$.subscribe(res => {
      this.isDark = res;
    });
    // this.isDark = this.darkTheme.isEnabled$.value;
    this.iconId = `#${this.icon}`;
  }

  doClick() {
    this.onClick.emit(this.selected);
  }

}
