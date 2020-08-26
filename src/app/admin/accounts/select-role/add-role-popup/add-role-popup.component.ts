import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-add-role-popup',
  templateUrl: './add-role-popup.component.html',
  styleUrls: ['./add-role-popup.component.scss']
})
export class AddRolePopupComponent implements OnInit {

  triggerElementRef: HTMLElement;
  options: {id: number, role: string, icon: string, description: string}[] = [];
  selectedRoles: {id: number, role: string, icon: string, description: string}[] = [];
  hoverOption;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<AddRolePopupComponent>
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.options = this.data['options'];
    this.selectedRoles = this.data['selectedRoles'];
    this.updatePosition();
  }

  isSelectedRole(role) {
    return this.selectedRoles.find(r => r.id === role.id);
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 245}px`, top: `${rect.bottom}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

}
