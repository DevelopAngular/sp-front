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
  @Input() headerBottomSpace: string = '8px';
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
    const pattern = /.\/assets\/\w+\(\w+\).svg/;
    // const pattern = /\^(assets)[A-Z]{1}\w+\b/;
    const iconName = /[A-Z]{1}[\w\s]+[^( \()]/;


    console.log(this.icon.match(iconName), this.icon, this.darkTheme.getIcon({
      iconName: this.icon,
      // darkFill: 'Navy',
      // lightFill: 'White',
      setting: null
    }));
    // console.log('./assets/SP Arrow (Navy).svg'.match(iconName), './assets/SP Arrow (Navy).svg');
  }

}
