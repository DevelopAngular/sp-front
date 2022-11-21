import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

interface PassLimitOverride {
  passLimit: number;
  studentCount: number;
  currentCount: number;
  isStudent: boolean;
}

@Component({
  selector: 'admin-pass-limits-dialog',
  templateUrl: './pass-limit-dialog.component.html',
  styleUrls: ['./pass-limit-dialog.component.scss'],
})
export class PassLimitDialogComponent {

  header: string;
  mainText: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PassLimitOverride) {
    if (!this.data.isStudent) {
      if (this.data.studentCount === 1) {
        this.header = `Limit reached: ${this.data.currentCount}/${this.data.passLimit} students have passes to this room`;
        this.mainText = 'If this is an emergency, you can override the limit.';
      } else {
        this.header = `Creating these ${this.data.studentCount} passes will exceed the room's ${this.data.passLimit} pass limit`;
        this.mainText = 'Are you sure you want to override the limit?';
      }
    } else {
      this.header = 'Room Limit Reached';
      this.mainText = 'Please wait for a spot to open.';
    }
  }
}
