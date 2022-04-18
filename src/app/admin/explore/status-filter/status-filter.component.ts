import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {cloneDeep, isEqual} from 'lodash';

import {User} from '../../../models/User';
import {Status} from '../../../models/Report';

@Component({
  selector: 'app-status-filter',
  templateUrl: './status-filter.component.html',
  styleUrls: ['./status-filter.component.scss'],
})
export class StatusFilterComponent implements OnInit {

  triggerElementRef: HTMLElement;

  selectedStatus: Status;
  initialStatus: Status = Status.Active;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Status,
    public dialogRef: MatDialogRef<StatusFilterComponent>,
  ) { }

  statuses: Status[keyof Status][];

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.selectedStatus = cloneDeep(this.data['status']);
    this.initialStatus = cloneDeep(this.data['status']);
    this.updateDialogPosition();

    this.statuses = Object.keys(Status).filter(k => isNaN(Number(k))).map(k => Status[k]);
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  updateStatus(status) {
    this.selectedStatus = status as Status;
    console.log(this.data, status, this.selectedStatus)
    this.dialogRef.close({status: this.selectedStatus});
  }

}
