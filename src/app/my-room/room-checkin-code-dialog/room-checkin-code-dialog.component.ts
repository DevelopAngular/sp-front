import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '../../models/Location';
import {generateRoomCode} from './generate-room-code';

@Component({
  selector: 'app-room-checkin-code-dialog',
  templateUrl: './room-checkin-code-dialog.component.html',
  styleUrls: ['./room-checkin-code-dialog.component.scss']
})
export class RoomCheckinCodeDialogComponent implements OnInit {

  selectedLocationData: Location;

  constructor(
    public dialogRef: MatDialogRef<RoomCheckinCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  ngOnInit(): void {
    console.log('data : ', this.dialogData);
    this.selectedLocationData = this.dialogData.roomData;
    const secondsSinceEpoch = Math.round(Date.now() / 1000);
    console.log('Code : ', generateRoomCode(secondsSinceEpoch, this.selectedLocationData.id));
  }

}
