import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';

@Component({
  selector: 'app-admin-card-button',
  templateUrl: './admin-card-button.component.html',
  styleUrls: ['./admin-card-button.component.scss']
})
export class AdminCardButtonComponent implements OnInit {

  @Input() title: string;
  @Input() leftIcon: string;
  @Input() subtitle: string;
  @Input() subtitleIcon: string;
  @Input() integrations: boolean;

  @Output() onClick: EventEmitter<any> = new EventEmitter();

  integrationIcons = [

  ];

  constructor(public darkTheme: DarkThemeSwitch) { }

  ngOnInit() {
  }

  getCardIcon(icon: string) {
    if (icon.includes('(')) {
        return this.darkTheme.getIcon({
            iconName: icon,
            darkFill: 'White',
            lightFill: 'Navy'
        });
    } else {
      return icon;
    }
  }

}
