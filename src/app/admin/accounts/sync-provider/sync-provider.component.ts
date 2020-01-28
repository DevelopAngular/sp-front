import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {GG4LSync} from '../../../models/GG4LSync';
import {AdminService} from '../../../services/admin.service';

declare const window;

@Component({
  selector: 'app-sync-provider',
  templateUrl: './sync-provider.component.html',
  styleUrls: ['./sync-provider.component.scss']
})
export class SyncProviderComponent implements OnInit {

  page: number = 1;
  gg4lInfo: GG4LSync;
  selectedProvider: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SyncProviderComponent>,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.gg4lInfo = this.data['gg4lInfo'];
  }

  selectProvider(provider) {
    if (provider === 'Sign in with Google') {
      this.selectedProvider = 'google-auth-token';
    } else if (provider === 'GG4L \n Passport') {
      this.selectedProvider = 'gg4l-sso';
    }
  }

  save() {
    if (this.page > 1) {
      this.adminService.updateSpSyncingRequest({ login_provider: this.selectedProvider }).subscribe(res => {
        this.dialogRef.close();
      });
    } else {
      this.page += 1;
    }
  }

  redirect() {
    window.open('https://smartpass.app/gg4l-help');
  }

}
