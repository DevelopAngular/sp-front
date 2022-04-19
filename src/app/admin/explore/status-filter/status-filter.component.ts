import {ChangeDetectionStrategy, Output, EventEmitter, Component, Inject, OnInit} from '@angular/core';
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

  type: 'selectedStatus';

  selectedStatus: Status;
  initialStatus: Status = Status.Active;

  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Status,
    public dialogRef: MatDialogRef<StatusFilterComponent>,
  ) { }

  statuses: Status[keyof Status][];

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.selectedStatus = cloneDeep(this.data['status']);
    this.initialStatus = cloneDeep(this.data['status']);
    this.type = this.data['type'];
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
    this.buttonClick.emit(this.selectedStatus);
    this.dialogRef.close({status: this.selectedStatus, type: this.type});
  }

}
