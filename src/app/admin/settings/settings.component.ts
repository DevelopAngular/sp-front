import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColorProfile } from '../../models/ColorProfile';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {BUILD_DATE} from '../../../build-info';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    triggerElementRef: ElementRef;

    isSwitchOption: boolean;

    hoveredProfile: boolean;
    hoveredTheme: boolean;
    pressedTheme: boolean;
    hoveredSignout: boolean;
    hovered: boolean;
    hoveredColor: string;
    version = 'Version 1.2';
    currentRelease = BUILD_DATE;


    public settings = [
        // {
        //     'gradient': '#022F68, #2F66AB',
        //     'icon': 'Moon',
        //     'action': () => { this.darkTheme.switchTheme(); this.data.darkBackground = !this.data.darkBackground; },
        //     'title': 'Dark Theme'
        // },
        {
            'gradient': '#1893E9, #05B5DE',
            'icon': 'Team',
            'hover_icon': './assets/Team (White).svg',
            'action': 'about',
            'title': 'About'
        },
        {
            'gradient': '#5E4FED, #7D57FF',
            'icon': 'Feedback',
            'hover_icon': './assets/Feedback (White).svg',
            'action': 'feedback',
            'title': 'Feedback'
        },
        {
            'gradient': '#F52B4F, #F37426',
            'icon': 'Support',
            'hover_icon': './assets/Support (White).svg',
            'action': 'support',
            'title': 'Support'
        },
    ];

    constructor(
        private router: Router,
        public dialogRef: MatDialogRef<SettingsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public darkTheme: DarkThemeSwitch,
        private elemRef: ElementRef
    ) {
    }

  get _themeBackground() {
    return this.hoveredTheme
      ?
      this.pressedTheme
        ?
        'radial-gradient(circle at 73% 71%, #022F68, #2F66AB)'
          : 'rgb(228, 235, 255)'
            : 'transparent';
  }

    ngOnInit() {
        this.triggerElementRef = this.data['trigger'];
        this.isSwitchOption = this.data['isSwitch'];
        this.updateCalendarPosition();
    }



    getIcon(iconName: string, setting: any,  hover?: boolean, hoveredColor?: string) {

      return this.darkTheme.getIcon({
        iconName: iconName,
        setting: setting,
        hover: hover,
        hoveredColor: hoveredColor
      });
    }

    getColor(setting?, hover?: boolean, hoveredColor?: string) {
      return this.darkTheme.getColor({
        setting: setting,
        hover: hover,
        hoveredColor: hoveredColor
      });
    }

    handleAction(setting) {
      if ( typeof setting.action === 'string' ) {
        this.dialogRef.close(setting.action);
      } else {
        setting.action();
      }
    }

    updateCalendarPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const dialogRect = this.elemRef.nativeElement.getBoundingClientRect();
      console.log(dialogRect);
      console.log(dialogRect.width);
      matDialogConfig.position = {
          left: `${this.data['possition'].x - 183}px`,
          bottom: `${(window.document.body as HTMLElement).clientHeight - this.data['possition'].y + 20}px`
        };

        this.dialogRef.updatePosition(matDialogConfig.position);
    }

    onHover(color) {
        this.hovered = true;
        this.hoveredColor = color;
    }
}
