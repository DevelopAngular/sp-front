import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-parent-invite-code-dialog',
  templateUrl: './parent-invite-code-dialog.component.html',
  styleUrls: ['./parent-invite-code-dialog.component.scss']
})
export class ParentInviteCodeDialogComponent implements OnInit {

  inviteCodeForm = new FormGroup({
    inviteCode: new FormControl()
  });

  constructor(
    public dialogRef: MatDialogRef<ParentInviteCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

}
