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
  profileStatus: string;
  hoverOption;
  showConfirmButton: boolean;
  isBulkEdit: boolean;

  options: {label: string, textColor: string, hoverColor: string, icon: string, description: string, status?: string}[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<StatusPopupComponent>
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.profile = this.data['profile'];
    this.isBulkEdit = this.data['bulkEdit'];
    this.profileStatus = this.data['profileStatus'];
    this.updatePosition();
    this.options = [
      {
        label: this.profileStatus === 'active' ? 'Disable account' + (this.isBulkEdit ? 's' : '') : 'Activate account' + (this.isBulkEdit ? 's' : ''),
        textColor: this.profileStatus === 'active' ? '#7f879d' : '#00B476',
        hoverColor: this.profileStatus === 'active' ? '#f1f2f4' : '#D1E8E0',
        icon: this.profileStatus === 'active' ? './assets/Stop (Blue-Gray).svg' : './assets/Check (Jade).svg',
        description: this.profileStatus === 'active' ? 'Disabling an account prevents them from signing in. They’ll still show up in SmartPass search, can make passes, etc.' :
          'Contact us at support@smartpass.app to activate your students and start your subscription.',
        status: this.profileStatus === 'active' ? 'disabled' : 'active'
      },
      {
        label: 'Suspend account' + (this.isBulkEdit ? 's' : ''),
        textColor: '#6651F1',
        hoverColor: '#ededfc',
        icon: './assets/Sleep (Purple).svg',
        description: 'Suspending an account will not delete any data association, but no-one will see or be able to interact with this account.',
        status: 'suspended'
      },
      {
        label: 'Delete account' + (this.isBulkEdit ? 's' : ''),
        textColor: '#E32C66',
        hoverColor: '#fce9ef',
        icon: './assets/Delete (Red).svg',
        description: 'Deleting an account will permanently delete any data associated with this account. This action cannot be undone.',
      }
    ];

    if (this.isBulkEdit) {
      this.options.splice(1, 0, {
        label: 'Disable account',
        textColor: '#7f879d',
        hoverColor: '#f1f2f4',
        icon: './assets/Stop (Blue-Gray).svg',
        description: 'Disabling an account prevents them from signing in. They’ll still show up in SmartPass search, can make passes, etc.',
        status: 'disabled'
      });
    }
  }

  updatePosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();

    matDialogConfig.position = { left: `${rect.left + rect.width - 245}px`, top: `${rect.bottom}px` };

    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  selectedOption(option) {
    if (option.label === 'Delete account' || option.label === 'Delete accounts') {
      this.showConfirmButton = true;
    } else {
      this.profileStatus = option.status;
      this.dialogRef.close(this.profileStatus);
    }
  }

}
