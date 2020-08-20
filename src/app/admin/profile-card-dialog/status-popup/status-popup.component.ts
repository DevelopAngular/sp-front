import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';
import {User} from '../../../models/User';

@Component({
  selector: 'app-status-popup',
  templateUrl: './status-popup.component.html',
  styleUrls: ['./status-popup.component.scss']
})
export class StatusPopupComponent implements OnInit {

  triggerElementRef: HTMLElement;
  profile: User;
  hoverOption;
  showConfirmButton: boolean;

  options: {label: string, hoverColor: string, icon: string, description: string}[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<StatusPopupComponent>
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.profile = this.data['profile'];
    this.updatePosition();
    this.options = [
      {label: 'Disable account', hoverColor: '#f1f2f4', icon: './assets/Stop (Blue-Gray).svg', description: 'Disabling an account prevents them from signing in. They’ll still show up in SmartPass search, can make passes, etc.'},
      {label: 'Suspend account', hoverColor: '#ededfc', icon: './assets/Sleep (Blue-Gray).svg', description: 'Suspending an account will not delete any data association, but no-one will see or be able to interact with this account.'},
      {label: 'Delete account', hoverColor: '#fce9ef', icon: './assets/Delete (Red).svg', description: 'Deleting an account will permanently delete any data associated with this account. This action cannot be undone.'}
    ];
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 245}px`, top: `${rect.bottom}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  selectedOption(option) {
    if (option.label === 'Delete account') {
      this.showConfirmButton = true;
    }
  }

}
