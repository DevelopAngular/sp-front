import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {cloneDeep, isEqual} from 'lodash';

import {User} from '../../../models/User';
import {Status} from '../../../models/Report';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusFilterComponent implements OnInit {

  triggerElementRef: HTMLElement;

  selectedStatus: Status;
  initialStatus: Status = Status.Active;

  isMultiSelect: boolean;
  update: boolean;

  type: 'selectedStatus';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<StatusFilterComponent>,
  ) { }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.type = this.data['type'];
    this.isMultiSelect = this.data['multiSelect'];
    if (this.data[this.type]) {
      this.selectedStatus = cloneDeep(this.data[this.type]);
      this.initialStatus = cloneDeep(this.data[this.type]);
    }
    this.updateDialogPosition();

    this.statuses = [Status.Active, Status.Closed];
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  updateStatus(status) {
    this.selectedStatus = status;
  }

  saveStatus() {
    this.dialogRef.close({status: this.selectedStatus, type: this.type});
  }

}
