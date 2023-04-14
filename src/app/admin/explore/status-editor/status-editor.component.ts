import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Status } from '../../../models/Report';
import { StatusBaseComponent } from '../status-base.component';

@Component({
	selector: 'app-status-editor',
	templateUrl: '../status-filter/status-filter.component.html',
	styleUrls: ['../status-filter/status-filter.component.scss'],
})
export class StatusEditorComponent extends StatusBaseComponent {
	type = 'editedStatus';

	constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<StatusEditorComponent>) {
		super(data, dialogRef);
	}

	ngAfterViewInit() {
		const $rect = this.panel.nativeElement;
		const rect = $rect.getBoundingClientRect();
		const position = {
			bottom: rect.bottom + document.scrollingElement.getClientRects()[0].top + 'px',
			left: rect.left + 'px',
		};
		const dx = rect.left < 0 ? -rect.left : 0;
		if (dx > 0) {
			position.left = 0 + 'px';
		}
		this.dialogRef.updatePosition(position);
	}
}
