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
	roles: string[];

	constructor(public dialogRef: MatDialogRef<NuxReferralComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router) {
		this.roles = data.roles;
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	NavToReferralPage() {
		const isAdmin = this.data.isAdmin;
		let targetRoute = '';

		if (isAdmin) {
			targetRoute = '/admin/refer_us';
		} else {
			targetRoute = '/main/refer_us';
		}

		console.log('Navigating to:', targetRoute);
		this.router.navigate([targetRoute]);
	}
}
