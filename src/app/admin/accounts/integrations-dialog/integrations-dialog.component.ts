import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-integrations-dialog',
  templateUrl: './integrations-dialog.component.html',
  styleUrls: ['./integrations-dialog.component.scss']
})
export class IntegrationsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<IntegrationsDialogComponent>
  ) { }

  ngOnInit() {
  }

  openSettings(action) {
    this.dialogRef.close(action);
  }

}
