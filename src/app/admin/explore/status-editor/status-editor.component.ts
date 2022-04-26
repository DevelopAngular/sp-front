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

  ngAfterViewInit() {
    const $rect = this.panel.nativeElement;
    const rect = $rect.getBoundingClientRect();
    const position = {
      top: rect.top + 'px', 
      bottom: rect.bottom + 'px', 
      left: rect.left + 'px', 
      right: rect.right + 'px',
    };
    // bottom is out of viewport
    // calculate dif
    const dy = (rect.bottom - (window.innerHeight || document.documentElement.clientHeight));
    // 0 is harsh, itmay be bigger enough not to allow an option to be hidden complete
    if (dy > 0) {
      position.top = (rect.top - dy)+'px';
    }
    const dx = (rect.left < 0 ? -rect.left : 0);
    if (dx > 0) {
      position.left = 0+'px';
    }
    if (!!dx || !!dy) this.dialogRef.updatePosition(position);
  }

  chooseStatus(status: Status) {
    super.chooseStatus(status);
    this.notifyer.setStatus(status);
  }
}
