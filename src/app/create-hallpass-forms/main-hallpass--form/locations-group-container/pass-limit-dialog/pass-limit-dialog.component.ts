import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'pass-limit-dialog',
  templateUrl: './pass-limit-dialog.component.html',
  styleUrls: ['./pass-limit-dialog.component.scss'],
})
export class PassLimitDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      passLimit: number,
      studentCount: number,
      currentCount: number
    },
    private dialogRef: MatDialogRef<PassLimitDialog>
  ) {
  }

  headText() {
    if (this.data.studentCount == 1)
      return `Limit reached: ${this.data.currentCount}/${this.data.passLimit} students have passes to this room`;
    else
      return `Creating these ${this.data.studentCount} passes will exceed the room's ${this.data.passLimit} pass limit`;
  }

  supportingText() {
    if (this.data.studentCount == 1)
      return 'If this is an emergency, you can override the limit.';
    else
      return 'Are you sure you want to override the limit?';
  }

  cancel() {
    this.dialogRef.close({override: false});
  }

  override() {
    this.dialogRef.close({override: true});
  }

}
