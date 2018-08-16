import { Component, OnInit } from '@angular/core';
import { MatDialog } from '../../../node_modules/@angular/material';
import { Router } from '../../../node_modules/@angular/router';
import { FavoriteFormComponent } from '../favorite-form/favorite-form.component';
import { ColorProfile } from '../models/ColorProfile';

export interface Setting {
  color_profile: ColorProfile;
  action: string;
  title: string;
}

declare var window;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settings: Setting[] = [];

  constructor(public router: Router, public dialog: MatDialog) {
    this.settings.push({
      'color_profile': new ColorProfile('', '', '#E7A700,#EFCE00', '#E7A700', '', '', ''),
      'action': 'favorite',
      'title': 'Favorites'
    });
    this.settings.push({
      'color_profile': new ColorProfile('', '', '#03CF31,#00B476', '#00B476', '', '', ''),
      'action': 'intro',
      'title': 'View Intro'
    });
    this.settings.push({
      'color_profile': new ColorProfile('', '', '#0B9FC1,#00C0C7', '#0B9FC1', '', '', ''),
      'action': 'team',
      'title': 'Our Team'
    });
    this.settings.push({
      'color_profile': new ColorProfile('', '', '#F52B4F,#F37426', '#F52B4F', '', '', ''),
      'action': 'support',
      'title': 'Support'
    });
    this.settings.push({
      'color_profile': new ColorProfile('', '', '#606981,#ACB4C1', '#6E7689', '', '', ''),
      'action': 'signout',
      'title': 'Sign out'
    });
  }

  ngOnInit() {
  }

  settingsAction(action: string) {
    if (action === 'signout') {
      this.router.navigate(['main/sign-out']);
    } else if (action === 'favorite') {
      const dialogRef = this.dialog.open(FavoriteFormComponent, {
        width: '750px',
        height: '365px',
        panelClass: 'form-dialog-container',
        backdropClass: 'custom-backdrop',
      });
    } else if (action === 'intro') {
      this.router.navigate(['/intro']);
    } else if (action === 'team') {
      window.open('https://smartpass.app/team.html');
    } else if (action === 'support') {
      window.open('https://smartpass.app/');
    }
  }

}
