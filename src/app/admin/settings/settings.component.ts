import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColorProfile } from '../../models/ColorProfile';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    triggerElementRef: ElementRef;
    hovered: boolean;
    hoveredColor: string;

    public settings = [
        {
            'gradient': '#1893E9, #05B5DE',
            'icon': './assets/Team (Blue-Gray).svg',
            'hover_icon': './assets/Team (White).svg',
            'action': 'about',
            'title': 'About'
        },
        {
            'gradient': '#5E4FED, #7D57FF',
            'icon': './assets/Feedback (Blue-Gray).svg',
            'hover_icon': './assets/Feedback (White).svg',
            'action': 'feedback',
            'title': 'Feedback'
        },
        {
            'gradient': '#F52B4F, #F37426',
            'icon': './assets/Support (Blue-Gray).svg',
            'hover_icon': './assets/Support (White).svg',
            'action': 'support',
            'title': 'Support'
        },
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

    onHover(color) {
        this.hovered = true;
        this.hoveredColor = color;
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
