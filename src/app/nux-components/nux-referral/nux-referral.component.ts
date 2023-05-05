import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
	selector: 'sp-nux-referral',
	templateUrl: './nux-referral.component.html',
	styleUrls: ['./nux-referral.component.scss'],
})
export class NuxReferralComponent {
	isAdmin: boolean;

	constructor(public dialogRef: MatDialogRef<NuxReferralComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router) {}

	onNoClick(): void {
		this.dialogRef.close();
	}

	NavToReferralPage() {
		if (this.data.isAdmin) {
			this.router.navigate(['/admin/refer_us']);
		} else {
			this.router.navigate(['/main/refer_us']);
		}
	}
}
