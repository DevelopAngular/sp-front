import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-notification-room-form',
	templateUrl: './notification-room-form.component.html',
	styleUrls: ['./notification-room-form.component.scss'],
})
export class NotificationRoomFormComponent implements OnInit {
	id: string;
	roomName: string;
	gradient: string;
	icon: string;
	form: FormGroup;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<NotificationRoomFormComponent>) {
		this.id = data['room']['id'];
		this.roomName = data['room']['title'];
		this.gradient = data['room']['color_profile']['gradient_color'];
		this.icon = data['room']['icon'];
		this.form = data['roomData'];
	}

	ngOnInit(): void {}

	close() {
		this.dialogRef.close({
			id: this.id,
			form: this.form,
		});
	}

	get roomBackground(): string {
		const colors = this.gradient.split(',');
		return `radial-gradient(circle at 73% 71%, ${colors[0]} 0%, ${colors[1]} 144%)`;
	}
}
