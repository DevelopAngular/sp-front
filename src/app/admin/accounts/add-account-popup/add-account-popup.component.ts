import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import {DarkThemeSwitch} from '../../../dark-theme-switch';

@Component({
  selector: 'app-add-account-popup',
  templateUrl: './add-account-popup.component.html',
  styleUrls: ['./add-account-popup.component.scss']
})
export class AddAccountPopupComponent implements OnInit {

  triggerElementRef: ElementRef;

  options = [
    { title: 'Add GG4L account', icon: './assets/GG4L Icon.svg' },
    { title: 'Add basic account', icon: `./assets/Admin`},
    { title: 'Bulk add basic accounts', icon: './assets/Bulk Accounts' }
  ];

  constructor(
    public dialogRef: MatDialogRef<AddAccountPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private darkTheme: DarkThemeSwitch
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
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
