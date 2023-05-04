import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'sp-nux-referral',
  templateUrl: './nux-referral.component.html',
  styleUrls: ['./nux-referral.component.scss']
})
export class NuxReferralComponent {
  constructor(
    public dialogRef: MatDialogRef<NuxReferralComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
