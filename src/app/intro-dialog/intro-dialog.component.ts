import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss']
})
export class IntroDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<IntroDialogComponent>,
  ) { }

  ngOnInit() {
  }
  onClose() {
    this.dialogRef.close();
  }

}
