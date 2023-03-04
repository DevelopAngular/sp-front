import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeatureFlagService, FLAGS } from '../../../services/feature-flag.service';

@Component({
	selector: 'app-call-dialog',
	templateUrl: './call-dialog.component.html',
	styleUrls: ['./call-dialog.component.scss'],
})
export class CallDialogComponent implements OnInit {
	triggerElementRef: ElementRef;
	public isProUser: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any[],
		public dialogRef: MatDialogRef<CallDialogComponent>,
		public featureFlags: FeatureFlagService
	) {}

	ngOnInit(): void {
		this.isProUser = this.featureFlags.isFeatureEnabled(FLAGS.PhoneAccess);
		this.triggerElementRef = this.data['trigger'];
		this.updatePosition();
	}

	updatePosition() {
		const matDialogConfig: MatDialogConfig = new MatDialogConfig();
		const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();

		matDialogConfig.position = { left: `${rect.left - 20}px`, bottom: `${rect.height + 30}px` };

		this.dialogRef.updatePosition(matDialogConfig.position);
	}
}
