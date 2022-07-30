import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-kiosk-mode',
  templateUrl: './confirm-delete-kiosk-mode.component.html',
  styleUrls: ['./confirm-delete-kiosk-mode.component.scss']
})
export class ConfirmDeleteKioskModeComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ConfirmDeleteKioskModeComponent>) { }

  ngOnInit(): void {
  }

  buttonAction(action) {
    this.dialogRef.close(action)
  }

}
