import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-start-pass-notification',
  templateUrl: './start-pass-notification.component.html',
  styleUrls: ['./start-pass-notification.component.scss']
})
export class StartPassNotificationComponent implements OnInit {

  title: string = 'Quick Reminder';
  subtitle: string = 'When you come back to the room, remember to end your pass!';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<StartPassNotificationComponent>
  ) { }

  ngOnInit() {
    // this.title = this.data['title'];
    // this.subtitle = this.data['subtitle'];
    this.updateDialogPosition();
  }

  close() {
    this.dialogRef.close();
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    matDialogConfig.position = {top: '170px'};
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

}
