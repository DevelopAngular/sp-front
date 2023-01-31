import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParentAccountService } from '../../services/parent-account.service';

@Component({
	selector: 'app-parent-invite-code-dialog',
	templateUrl: './parent-invite-code-dialog.component.html',
	styleUrls: ['./parent-invite-code-dialog.component.scss'],
})
export class ParentInviteCodeDialogComponent implements OnInit {
	inviteCodeForm = new FormGroup({
		student_code: new FormControl(),
	});

	constructor(
		public dialogRef: MatDialogRef<ParentInviteCodeDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private parentService: ParentAccountService
	) {}

	ngOnInit(): void {}

	addStudent() {
		this.parentService.addStudent({ ...this.inviteCodeForm.value }).subscribe({
			next: (result: any) => {
				console.log('result : ', result);
				this.dialogRef.close();
			},
		});
	}

	openLink(link) {
		window.open(link);
	}
}
