import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '../../models/Location';

@Component({
  selector: 'app-room-checkin-code-dialog',
  templateUrl: './room-checkin-code-dialog.component.html',
  styleUrls: ['./room-checkin-code-dialog.component.scss']
})
export class RoomCheckinCodeDialogComponent implements OnInit {

  selectedLocationData: Location

  constructor(
    public dialogRef: MatDialogRef<RoomCheckinCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) { }

  ngOnInit(): void {
    console.log("data : ", this.dialogData)
    this.selectedLocationData = this.dialogData.roomData;
    // console.log("Code : ", this.generateRoomCode(1, 234))
  }

  // generateRoomCode(secondsSinceEpoch: number, locationId: number): string {
  //   const period = secondsSinceEpoch / 30;
  
  //   const buffer = new ArrayBuffer(8);
  //   new DataView(buffer).setBigUint64(0, BigInt(period), false);
  //   const timeBytes = new BigUint64Array(buffer);
  
  //   const buffer2 = new ArrayBuffer(8);
  //   new DataView(buffer2).setBigUint64(0, BigInt(locationId), false);
  //   const locationIdBytes = new BigUint64Array(buffer2);
  
  //   const crypto = require('crypto');
  //   const shasum = crypto.createHash('sha1');
  
  //   shasum.update(timeBytes);
  //   shasum.update(locationIdBytes);
  //   const sumbuffer = shasum.digest();
  
  //   const num = sumbuffer.readUint16BE(0);
  //   return String(num).padStart(3, '0');
  // }

}
