import { Component, OnInit, Input } from '@angular/core';
import { NavbarDataService } from '../main/navbar-data.service';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-display-card',
  templateUrl: './display-card.component.html',
  styleUrls: ['./display-card.component.scss']
})
export class DisplayCardComponent implements OnInit {
  @Input() mock: number = null;
  @Input() backgroundColor: string;
  @Input() headerBottomSpace: string = '15px';
  @Input() hasDivider: boolean = true;
  @Input() inbox: boolean = false;
  @Input() title: string;
  @Input() icon: string;
  @Input() iconSize: string = '20px';
  @Input() fontSize: string;
  @Input() righticon: string;
  @Input() subtitle: string;
  @Input() subtitle_fontSize: string;
  @Input() righttext:string;


  constructor(
    private navbarData: NavbarDataService,
    public darkTheme: DarkThemeSwitch
  ) { }

  get notificationBadge$() {
    return this.navbarData.notificationBadge$;
  }

  getIcon(icon) {
    return this.darkTheme.getIcon({
      iconName: icon,
      darkFill: 'White',
      lightFill: 'Navy',
      setting: null
    });
  }

  get titleColor () {
    return this.darkTheme.getColor({dark: '#FFFFFF', white: '#1F195E'});
  }

  ngOnInit() {

  }

}
