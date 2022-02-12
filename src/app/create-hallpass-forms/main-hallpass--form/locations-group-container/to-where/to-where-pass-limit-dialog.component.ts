import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'to-where-pass-limit-dialog',
  templateUrl: './to-where-pass-limit-dialog.component.html',
  styleUrls: ['./to-where-pass-limit-dialog.component.scss'],
})
export class ToWherePassLimitDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { passLimit: number, studentCount: number },
    private dialogRef: MatDialogRef<ToWherePassLimitDialog>
  ) {
  }

  headText() {
    if (this.data.studentCount == 1)
      return `Limit reached: ${this.data.passLimit}/${this.data.passLimit} students have passes to this room`;
    else
      return `Creating these ${this.data.studentCount} passes will exceed the room's ${this.data.passLimit} pass limit`
  }

  cancel() {
    this.dialogRef.close({override: false});
  }

  override() {
    this.dialogRef.close({override: true});
  }

}
