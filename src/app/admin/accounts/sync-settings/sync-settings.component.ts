import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { GG4LSync } from '../../../models/GG4LSync';
import {AdminService} from '../../../services/admin.service';

@Component({
  selector: 'app-sync-settings',
  templateUrl: './sync-settings.component.html',
  styleUrls: ['./sync-settings.component.scss']
})
export class SyncSettingsComponent implements OnInit {

  gg4lInfo: GG4LSync;
  selectedProvider: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.gg4lInfo = this.data['gg4lInfo'];
    this.adminService.schoolSyncInfo$.subscribe(res => {
      if (res.login_provider === 'google-auth-token') {
        this.selectedProvider = 'Sign in with Google';
      } else if (res.login_provider === 'gg4l-sso') {
        this.selectedProvider = 'GG4L \n Passport';
      }
    });
  }

}
