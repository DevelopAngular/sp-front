import { Component, OnInit } from '@angular/core';
import { ColorProfile } from '../models/ColorProfile';

export interface Setting{
  color_profile: ColorProfile;
  action: string;
  title: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settings: Setting[] = [];

  constructor() {
    this.settings.push({'color_profile': new ColorProfile('', '', '#606981,#ACB4C1', '#6E7689', '', '', ''), 'action': 'signout' , 'title': 'Sign-Out'});
    this.settings.push({'color_profile': new ColorProfile('', '', '#E7A700,#EFCE00', '#E7A700', '', '', ''), 'action': 'favorite' , 'title': 'Favorites'});
    this.settings.push({'color_profile': new ColorProfile('', '', '#03CF31,#00B476', '#00B476', '', '', ''), 'action': 'intro' , 'title': 'View Intro'});
    this.settings.push({'color_profile': new ColorProfile('', '', '#0B9FC1,#00C0C7', '#0B9FC1', '', '', ''), 'action': 'team' , 'title': 'Our Team'});
    this.settings.push({'color_profile': new ColorProfile('', '', '#F52B4F,#F37426', '#F52B4F', '', '', ''), 'action': 'support' , 'title': 'Support'});
  }

  ngOnInit() {
  }

  settingsAction(action: string){
    if(action==='signout'){

    } else if(action==='favorite'){

    } else if(action==='intro'){
      
    } else if(action==='team'){
      
    } else if(action==='support'){
      
    }
  }

}
