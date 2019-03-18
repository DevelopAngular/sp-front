import {Component, ElementRef, Inject, NgZone, OnInit, Renderer2, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import { Router } from '@angular/router';
import { DataService } from '../services/data-service';
import { FavoriteFormComponent } from '../favorite-form/favorite-form.component';
import { LoadingService } from '../services/loading.service';
import { ColorProfile } from '../models/ColorProfile';
import { User } from '../models/User';
import {switchMap} from 'rxjs/operators';
import {LocationsService} from '../services/locations.service';
import {NotificationFormComponent} from '../notification-form/notification-form.component';

export interface Setting {
  color_profile: string;
  icon: string;
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

  hovered: boolean;

  constructor(
      public router: Router,
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
      'action': 'favorite',
      'title': 'Favorites'
    });
    this.settings.push({
      'color_profile': '#DA2370, #FB434A',
      'icon': './assets/Notifications (Blue-Gray).svg',
      'action': 'notifications',
      'title': 'Notifications'
    });
    this.settings.push({
      'color_profile': '#03CF31, #00B476',
      'icon': './assets/Info (Blue-Gray).svg',
      'action': 'intro',
      'title': 'View Intro'
    });
    this.settings.push({
      'color_profile': '#0B9FC1, #00C0C7',
      'icon': './assets/Team (Blue-Gray).svg',
      'action': 'about',
      'title': 'About'
    });
    this.settings.push({
        'color_profile': '#5E4FED, #7D57FF',
        'icon': './assets/Feedback (Blue-Gray).svg',
        'action': 'feedback',
        'title': 'Feedback'
    });
    this.settings.push({
      'color_profile': '#F52B4F, #F37426',
      'icon': './assets/Support (Blue-Gray).svg',
      'action': 'support',
      'title': 'Support'
    });
    // this.settings.push({
    //   'color_profile': new ColorProfile('', '', '#606981,#ACB4C1', '#6E7689', '', '', ''),
    //   'icon': '',
    //   'action': 'signout',
    //   'title': 'Sign out'
    // });
  }

  ngOnInit() {
    this.targetElementRef = this.data['trigger'];
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

  updateDialogPosition() {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
          matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 168 }px`, top: `${rect.bottom + 5}px` };

      this.dialogRef.updatePosition(matDialogConfig.position);
  }

}
