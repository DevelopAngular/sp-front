import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-id-card-grade-levels',
	template: `<app-grade-levels [page]="2" (backEmit)="dialogRef.close()"></app-grade-levels>`,
	styleUrls: ['./id-card-grade-levels.component.scss'],
})
export class IdCardGradeLevelsComponent {
	isUploadedGradeLevels: boolean = false;

	constructor(public dialogRef: MatDialogRef<IdCardGradeLevelsComponent>) {}
}
