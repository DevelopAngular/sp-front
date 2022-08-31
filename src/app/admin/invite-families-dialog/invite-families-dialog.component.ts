import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invite-families-dialog',
  templateUrl: './invite-families-dialog.component.html',
  styleUrls: ['./invite-families-dialog.component.scss']
})
export class InviteFamiliesDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InviteFamiliesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
  }

  back() {
    this.dialogRef.close();
}

}
