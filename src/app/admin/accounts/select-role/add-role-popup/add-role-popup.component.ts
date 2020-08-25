import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-add-role-popup',
  templateUrl: './add-role-popup.component.html',
  styleUrls: ['./add-role-popup.component.scss']
})
export class AddRolePopupComponent implements OnInit {

  triggerElementRef: HTMLElement;
  options: {role: string, icon: string};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<AddRolePopupComponent>
  ) { }

  ngOnInit() {
    this.updatePosition();
    this.triggerElementRef = this.data['trigger'];
    this.options = this.data['options'];
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 245}px`, top: `${rect.bottom}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

}
