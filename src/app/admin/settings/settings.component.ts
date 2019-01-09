import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColorProfile } from '../../models/ColorProfile';

declare const window;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public settings = [
    {
      'color_profile': new ColorProfile('', '', '#1893E9,#05B5DE', '#139BE6', '', '', ''),
      'action': 'about',
      'title': 'About'
    },
    {
      'color_profile': new ColorProfile('', '', '#606981,#ACB4C1', '#6E7689', '', '', ''),
      'action': 'signout',
      'title': 'Sign out'
    }
  ];

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  settingsAction(action: string) {
    if (action === 'signout') {
      this.router.navigate(['sign-out']);
    } else if (action === 'about') {
      window.open('https://smartpass.app/about');
    }
  }

}
