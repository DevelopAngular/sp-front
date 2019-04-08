import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColorProfile } from '../../models/ColorProfile';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import {DarkThemeSwitch} from '../../dark-theme-switch';

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
    hoveredSignout: boolean;
    hovered: boolean;
    hoveredColor: string;


    // settings: = [
    //   {
    //     // 'gradient': '#1893E9, #05B5DE',
    //     'icon': './assets/Profile Switch (Blue-Gray).svg',
    //     'icon-dark': './assets/Profile Switch (White).svg',
    //     'hover_icon': './assets/Profile Switch (White).svg',
    //     'hover_icon-dark': './assets/Profile Switch (Navy).svg',
    //   },
    // ]

    public settings = [
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
        @Inject(MAT_DIALOG_DATA) public data: any[],
        public darkTheme: DarkThemeSwitch,
    ) {
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

    updateCalendarPosition() {
        const matDialogConfig: MatDialogConfig = new MatDialogConfig();
        const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
        const top = this.isSwitchOption ? 405 : 285;
        matDialogConfig.position = {left: `${rect.left - 170}px`, top: `${rect.top - top}px`};

        this.dialogRef.updatePosition(matDialogConfig.position);
    }

    onHover(color) {
        this.hovered = true;
        this.hoveredColor = color;
    }
}
