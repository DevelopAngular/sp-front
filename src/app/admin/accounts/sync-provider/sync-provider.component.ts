import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {GG4LSync} from '../../../models/GG4LSync';

declare const window;

@Component({
  selector: 'app-sync-provider',
  templateUrl: './sync-provider.component.html',
  styleUrls: ['./sync-provider.component.scss']
})
export class SyncProviderComponent implements OnInit {

  page: number = 1;
  gg4lInfo: GG4LSync;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SyncProviderComponent>
  ) { }

  ngOnInit() {
    this.gg4lInfo = this.data['gg4lInfo'];
  }

  save() {
    if (this.page > 1) {
      // Todo request to server
      this.dialogRef.close();
    } else {
      this.page += 1;
    }
  }

  redirect() {
    window.open('https://smartpass.app/gg4l-help');
  }

}
