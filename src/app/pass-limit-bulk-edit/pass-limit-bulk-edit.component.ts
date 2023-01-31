import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/User';
import { PassLimitService } from '../services/pass-limit.service';
import { HallPassLimit } from '../models/HallPassLimits';
import { PassLimitInputComponent } from '../pass-limit-input/pass-limit-input.component';

const individualPassLimitRangeValidator =
	(): ValidatorFn =>
	(form: FormGroup): ValidationErrors => {
		if (form.value['passLimit'] === 'Unlimited') {
			return null;
		}
		const num = parseInt(form.value['passLimit'], 10);
		if (num === NaN) {
			return { format: true };
		}
		if (num < -2 || num > 50) {
			return { range: true };
		}
		return null;
	};

@Component({
	selector: 'app-pass-limit-bulk-edit',
	templateUrl: './pass-limit-bulk-edit.component.html',
	styleUrls: ['./pass-limit-bulk-edit.component.scss'],
})
export class PassLimitBulkEditComponent implements OnInit {
	requestLoading = false;
	passLimitForm = new FormGroup(
		{
			passLimit: new FormControl(null, [Validators.required, Validators.pattern(/^([1-9]\d*)$|^(0){1}$|^(Unlimited)$/)]),
			description: new FormControl(null),
		},
		individualPassLimitRangeValidator()
	);
	passLimitFormLastValue = { passLimit: null, description: '' };
	passLimitFormChanged: Observable<boolean>;
	contentLoading = true;
	schoolPassLimit: HallPassLimit;

	@ViewChild('passLimitInput') passLimitInput: PassLimitInputComponent;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { students: User[] },
		public dialogRef: MatDialogRef<PassLimitBulkEditComponent>,
		private passLimitService: PassLimitService
	) {}

	ngOnInit(): void {
		this.passLimitService.getPassLimit().subscribe({
			next: (pl) => {
				this.schoolPassLimit = pl.pass_limit;
				this.contentLoading = false;
			},
		});
		this.passLimitFormChanged = this.passLimitForm.statusChanges.pipe(
			switchMap(() => this.passLimitForm.valueChanges),
			map((v) => {
				if (!v.passLimit) {
					v.passLimit = null;
				}
				return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);
			})
		);
	}

	updatePassLimits() {
		const parsedForm = {
			passLimit: this.passLimitForm.value.passLimit === 'Unlimited' ? -2 : parseInt(this.passLimitForm.value.passLimit, 10),
			description: (this.passLimitForm?.value?.description || '').trim(),
		};

		this.requestLoading = true;
		this.passLimitService
			.updateIndividualLimit({
				...parsedForm,
				students: this.data.students.map((u) => parseInt(u.id, 10)),
			})
			.subscribe({
				next: () => {
					this.dialogRef.close(true); // triggerUpdated
				},
				error: (err) => {
					this.requestLoading = false;
				},
			});
	}

	resetPassLimitsForm() {
		this.passLimitForm.patchValue(this.passLimitFormLastValue);
		if (this.passLimitInput?.passLimitDropdownRef?.getState() === MatDialogState.OPEN) {
			this.passLimitInput.passLimitDropdownRef.close();
		}
	}
}
