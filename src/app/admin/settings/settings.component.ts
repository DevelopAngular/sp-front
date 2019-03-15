import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ColorProfile } from '../../models/ColorProfile';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';

declare const window;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    triggerElementRef: ElementRef;
    public settings = [
        {
            'color_profile': new ColorProfile('', '', '#1893E9,#05B5DE', '#139BE6', '', '', ''),
            'icon': './assets/Accounts (Grey).png',
            'action': 'about',
            'title': 'About'
        },
        {
            'gradient': '',
            'icon': './assets/Feedback (Blue-Gray).svg',
            'action': 'feedback',
            'title': 'Feedback'
        },
        {
            'gradient': '',
            'icon': './assets/Support (Grey).png',
            'action': 'support',
            'title': 'Support'
        },
        // {
        //   'color_profile': new ColorProfile('', '', '#606981,#ACB4C1', '#6E7689', '', '', ''),
        //   'action': 'signout',
        //   'title': 'Sign out'
        // }
    ];

    constructor(
        private router: Router,
        public dialogRef: MatDialogRef<SettingsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any[],
    ) {
    }

    ngOnInit() {
        this.triggerElementRef = this.data['trigger'];
        this.updateCalendarPosition();
    }

    updateCalendarPosition() {
        const matDialogConfig: MatDialogConfig = new MatDialogConfig();
        const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
        matDialogConfig.position = {left: `${rect.left - 170}px`, top: `${rect.top - 285}px`};

        this.dialogRef.updatePosition(matDialogConfig.position);
    }

    // settingsAction(action: string) {
    //     if (action === 'signout') {
    //         this.router.navigate(['sign-out']);
    //     } else if (action === 'about') {
    //         window.open('https://smartpass.app/about');
    //     } else if (action === 'feedback') {
    //         window.open('https://www.smartpass.app/feedback');
    //     } else if (action === 'support') {
    //         window.open('https://www.smartpass.app/support');
    //     }
    //
    // }
}
