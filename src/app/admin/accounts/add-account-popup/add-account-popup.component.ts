import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';

@Component({
  selector: 'app-add-account-popup',
  templateUrl: './add-account-popup.component.html',
  styleUrls: ['./add-account-popup.component.scss']
})
export class AddAccountPopupComponent implements OnInit {

  triggerElementRef: ElementRef;
  syncData: SchoolSyncInfo;

  options = [
    { title: 'Add basic account', icon: `./assets/Admin`, action: 'standard'},
    { title: 'Bulk add basic accounts', icon: './assets/Bulk Accounts', action: 'bulk' }
  ];

  constructor(
    public dialogRef: MatDialogRef<AddAccountPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private darkTheme: DarkThemeSwitch
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.syncData = this.data['syncData'];

    if (this.syncData.is_gg4l_enabled) {
      this.options.push({ title: 'Add GG4L account', icon: './assets/GG4L Icon.svg', action: 'gg4l' });
    }
    if (this.syncData.is_gsuite_enabled) {
      this.options.push({title: 'Add G_Suite Account', icon: './assets/Google (Color).svg', action: 'g_suite'});
    }
    this.updateSettingsPosition();
  }

  updateSettingsPosition() {
    if (this.dialogRef) {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = {left: `${rect.left - 147}px`, top: `${rect.top + 60}px`};
      this.dialogRef.updatePosition(matDialogConfig.position);
    }
  }

}
