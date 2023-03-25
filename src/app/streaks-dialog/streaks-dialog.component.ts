import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-streaks-dialog',
	templateUrl: './streaks-dialog.component.html',
	styleUrls: ['./streaks-dialog.component.scss'],
})
export class StreaksDialogComponent implements OnInit {
	triggerElementRef: ElementRef;
	streaksCount: number;
	isLost: boolean;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any[], public matDialogRef: MatDialogRef<StreaksDialogComponent>) {}

	ngOnInit(): void {
		this.triggerElementRef = this.data['trigger'];
		this.streaksCount = this.data['streaks_count'];
		this.isLost = this.data['is_lost'];
		this.updatePosition();
	}

	updatePosition() {
		const matDialogConfig: MatDialogConfig = new MatDialogConfig();
		if (this.triggerElementRef && this.matDialogRef) {
			const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
			matDialogConfig.position = { left: `${rect.left - 233}px`, top: `${rect.top + rect.height + 10}px` };
			this.matDialogRef.updatePosition(matDialogConfig.position);
		}
	}
}
