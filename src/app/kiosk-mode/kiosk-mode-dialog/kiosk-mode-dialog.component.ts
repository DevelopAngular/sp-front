import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-kiosk-mode-dialog',
  templateUrl: './kiosk-mode-dialog.component.html',
  styleUrls: ['./kiosk-mode-dialog.component.scss']
})
export class KioskModeDialogComponent implements OnInit {

  loginInfoForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<KioskModeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.loginInfoForm = new FormGroup({
      username: new FormControl({value: 'library-53283', disabled: true}),
      password: new FormControl({value: 'wlkjwFwka93', disabled: true})
    });
    console.log("data : ", this.data);
  }

  fetchLoginData(){

  }

  back() {
      this.dialogRef.close();
  }

}
