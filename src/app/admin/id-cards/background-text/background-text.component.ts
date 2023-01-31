import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-background-text',
	templateUrl: './background-text.component.html',
	styleUrls: ['./background-text.component.scss'],
})
export class BackgroundTextComponent {
	public text: string = '';

	constructor(public dialogRef: MatDialogRef<BackgroundTextComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
		data?.text ? (this.text = data.text) : null;
	}
}
