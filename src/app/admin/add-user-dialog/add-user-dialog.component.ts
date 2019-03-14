import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  public accountTypes: string[] = ['G Suite', 'Alternative'];
  public typeChoosen: string = this.accountTypes[0];
  public newAlternativeAccount: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>
  ) {

  }

  ngOnInit() {
    this.newAlternativeAccount = new FormGroup({
      name: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl(''),
    });

  }
  setSelectedUsers(evt) {
    return;
  }
}
