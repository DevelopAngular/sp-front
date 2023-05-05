import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParentAccountService } from '../../services/parent-account.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-parent-invite-code-dialog',
	templateUrl: './parent-invite-code-dialog.component.html',
	styleUrls: ['./parent-invite-code-dialog.component.scss'],
})
export class ParentInviteCodeDialogComponent implements OnInit {
	errorMessage: string;
	inviteCodeForm = new FormGroup({
		student_code: new FormControl(null, Validators.required),
	});

	constructor(
		public dialogRef: MatDialogRef<ParentInviteCodeDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private parentService: ParentAccountService
	) {}

	ngOnInit(): void {}

	addStudent() {
		this.errorMessage = '';
		this.parentService.addStudent({ ...this.inviteCodeForm.value }).subscribe({
			next: () => {
				this.dialogRef.close();
			},
			error: (err: HttpErrorResponse) => {
				try {
					const { detail } = err.error;
					this.errorMessage = detail[0].toUpperCase() + detail.slice(1) + '!';
				} catch {
					// in the case the above code tries to access undefined values from the error object
					this.errorMessage = 'Could not link student!';
				}
			},
		});
	}

	openLink(link) {
		window.open(link);
	}
}
