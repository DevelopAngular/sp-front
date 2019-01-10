import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-error-toast',
  templateUrl: './error-toast.component.html',
  styleUrls: ['./error-toast.component.scss']
})
export class ErrorToastComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ErrorToastComponent>
  ) { }

  ngOnInit() {
  }
  close() {
    this.dialogRef.close();
  }
}
