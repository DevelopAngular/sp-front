import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'to-where-pass-limit-dialog',
  templateUrl: './to-where-pass-limit-dialog.component.html',
  styleUrls: ['./to-where-pass-limit-dialog.component.scss'],
})
export class ToWherePassLimitDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { passLimit: number },
    private dialogRef: MatDialogRef<ToWherePassLimitDialog>
  ) {
  }

  cancel() {
    this.dialogRef.close({override: false});
  }

  override() {
    this.dialogRef.close({override: true});
  }

}
