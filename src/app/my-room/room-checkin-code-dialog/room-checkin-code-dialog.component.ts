import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Location } from '../../models/Location';
import { generateRoomCode } from './generate-room-code';

@Component({
	selector: 'app-room-checkin-code-dialog',
	templateUrl: './room-checkin-code-dialog.component.html',
	styleUrls: ['./room-checkin-code-dialog.component.scss'],
})
export class RoomCheckinCodeDialogComponent implements OnInit, AfterViewInit {
	selectedLocationData: Location;

	color = '#07ABC3';
	mode: ProgressSpinnerMode = 'determinate';
	value = 50;

	constructor(public dialogRef: MatDialogRef<RoomCheckinCodeDialogComponent>, @Inject(MAT_DIALOG_DATA) public dialogData: any) {}

	ngOnInit(): void {
		this.selectedLocationData = this.dialogData.roomData;
	}

	get RoomCode() {
		const secondsSinceEpoch = Math.round(Date.now() / 1000);
		return generateRoomCode(secondsSinceEpoch, this.selectedLocationData.id);
	}

	get RemainSeconds() {
		var seconds = new Date().getSeconds();

		if (seconds == 30) {
			return 30;
		} else if (seconds < 30) {
			return 30 - seconds;
		} else {
			return 60 - seconds;
		}
	}

	get SpinnerValue() {
		return (this.RemainSeconds * 100) / 30;
	}

	ngAfterViewInit() {
		// if(!!this.color){
		//   const element = this.elem.nativeElement;
		//   const circle = element.querySelector("circle");
		//   circle.style.stroke = this.color;
		// }
	}

	closeRoomCode() {
		this.dialogRef.close();
	}
}
