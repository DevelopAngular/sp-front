import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { GG4LSync } from '../../../models/GG4LSync';

@Component({
  selector: 'app-sync-settings',
  templateUrl: './sync-settings.component.html',
  styleUrls: ['./sync-settings.component.scss']
})
export class SyncSettingsComponent implements OnInit {

  gg4lInfo: GG4LSync;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.gg4lInfo = this.data['gg4lInfo'];
  }

}
