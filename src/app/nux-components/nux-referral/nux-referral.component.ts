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
			const url = this.router.serializeUrl(this.router.createUrlTree(['admin', 'refer_us']));
			window.open(url, '_blank');
		} else {
			const url = this.router.serializeUrl(this.router.createUrlTree(['main', 'refer_us']));
			window.open(url, '_blank');
		}
		this.dialogRef.close();
	}
}
