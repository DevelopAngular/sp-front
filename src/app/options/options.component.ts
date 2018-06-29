import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<OptionsComponent>) {
  }

  ngOnInit() {
  }

  close(action) {
    this.dialogRef.close(action);
  }
}
