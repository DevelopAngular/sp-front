// nux-components/nux-referral/nux-referral.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
	selector: 'sp-nux-referral',
	templateUrl: './nux-referral.component.html',
	styleUrls: ['./nux-referral.component.scss'],
})
export class NuxReferralComponent {
	isAdmin: boolean;

	constructor(
		public dialogRef: MatDialogRef<NuxReferralComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { isAdmin: boolean },
		private router: Router
	) {
		this.isAdmin = data.isAdmin;
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	NavToReferralPage() {
		if (this.isAdmin) {
			this.router.navigate(['admin', 'refer_us']);
		} else {
			this.router.navigate(['main', 'refer_us']);
		}
		this.dialogRef.close();
	}
}
