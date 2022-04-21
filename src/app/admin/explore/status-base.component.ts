import {Output, EventEmitter, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {Status} from '../../models/Report';

@Component({ template: '' })
export class StatusBaseComponent implements OnInit {

  triggerElementRef: HTMLElement;

  readonly type:string = 'selectedStatus';

  selectedStatus: Status;
  initialStatus: Status;

  @Output() buttonClick: EventEmitter<Status> = new EventEmitter<Status>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Status,
    public dialogRef: MatDialogRef<StatusBaseComponent>,
  ) { }

  statuses: Status[keyof Status][];

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.selectedStatus = this.data['status'];
    this.initialStatus = this.data['status'];
    //this.type = this.data['type'];
    this.updateDialogPosition();

    this.statuses = Object.keys(Status).filter(k => isNaN(Number(k))).map(k => Status[k]);
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    // align to left as it appears to be aligned to the right
    // 204 is width of status container
    matDialogConfig.position = { left: `${rect.left - (204 - rect.width)}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  chooseStatus(status: Status) {
    this.selectedStatus = status as Status;
    this.buttonClick.emit(this.selectedStatus);
    this.dialogRef.close({status: this.selectedStatus, type: this.type});
  }

}

