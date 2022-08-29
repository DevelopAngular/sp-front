import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-notification-select-students-dialog',
  templateUrl: './notification-select-students-dialog.component.html',
  styleUrls: ['./notification-select-students-dialog.component.scss']
})
export class NotificationSelectStudentsDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NotificationSelectStudentsDialogComponent>) { }

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }

  choose(student) {
    this.dialogRef.close(student);
  }

}
