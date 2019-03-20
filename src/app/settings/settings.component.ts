import { Component, ElementRef, Inject, NgZone, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { DataService } from '../services/data-service';
import { LoadingService } from '../services/loading.service';
import { User } from '../models/User';

export interface Setting {
  color_profile: string;
  icon: string;
  hover_icon: string;
  action: string;
  title: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  targetElementRef: ElementRef;
  settings: Setting[] = [];
  user: User;
  isStaff: boolean;

  isSwitch: boolean;

  hoveredPofile: boolean;
  hovered: boolean;
  hoveredColor: string;

  constructor(
      public dialog: MatDialog,
      @Inject(MAT_DIALOG_DATA) public data: any[],
      public dialogRef: MatDialogRef<SettingsComponent>,
      private dataService: DataService,
      private _zone: NgZone,
      public loadingService: LoadingService,
  ) {
    this.settings.push({
      'color_profile': '#E7A700, #EFCE00',
      'icon': './assets/Star (Blue-Gray).svg',
      'hover_icon': './assets/Star (White).svg',
      'action': 'favorite',
      'title': 'Favorites'
    });
    this.settings.push({
      'color_profile': '#DA2370, #FB434A',
      'icon': './assets/Notifications (Blue-Gray).svg',
      'hover_icon': './assets/Notifications (White).svg',
      'action': 'notifications',
      'title': 'Notifications'
    });
    this.settings.push({
      'color_profile': '#03CF31, #00B476',
      'icon': './assets/Info (Blue-Gray).svg',
      'hover_icon': './assets/Info (White).svg',
      'action': 'intro',
      'title': 'View Intro'
    });
    this.settings.push({
      'color_profile': '#0B9FC1, #00C0C7',
      'icon': './assets/Team (Blue-Gray).svg',
      'hover_icon': './assets/Team (White).svg',
      'action': 'about',
      'title': 'About'
    });
    this.settings.push({
        'color_profile': '#5E4FED, #7D57FF',
        'icon': './assets/Feedback (Blue-Gray).svg',
        'hover_icon': './assets/Feedback (White).svg',
        'action': 'feedback',
        'title': 'Feedback'
    });
    this.settings.push({
      'color_profile': '#F52B4F, #F37426',
      'icon': './assets/Support (Blue-Gray).svg',
      'hover_icon': './assets/Support (White).svg',
      'action': 'support',
      'title': 'Support'
    });
  }

  ngOnInit() {
    this.targetElementRef = this.data['trigger'];
    this.isSwitch = this.data['isSwitch'];

    this.updateDialogPosition();
    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {
        this._zone.run(() => {
          this.user = user;
          this.isStaff = user.roles.includes('edit_all_hallpass');
        });
      });
  }

  onHover(color) {
    this.hovered = true;
    this.hoveredColor = color;
  }

  updateDialogPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
          matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 168 }px`, top: `${rect.bottom + 10}px` };

      this.dialogRef.updatePosition(matDialogConfig.position);
  }
}
