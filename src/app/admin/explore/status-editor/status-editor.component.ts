import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {Status} from '../../../models/Report';
import {StatusBaseComponent} from '../status-base.component';
import {StatusNotifyerService} from '../status-notifyer.service';

@Component({
  selector: 'app-status-editor',
  templateUrl: '../status-filter/status-filter.component.html',
  styleUrls: ['../status-filter/status-filter.component.scss'],
})
export class StatusEditorComponent extends StatusBaseComponent {
  type = 'editedStatus';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Status,
    public dialogRef: MatDialogRef<StatusEditorComponent>,
    public notifyer: StatusNotifyerService) {
    super(data, dialogRef);
  }

  chooseStatus(status: Status) {
    super.chooseStatus(status);
    this.notifyer.setStatus(status);
  }
}
