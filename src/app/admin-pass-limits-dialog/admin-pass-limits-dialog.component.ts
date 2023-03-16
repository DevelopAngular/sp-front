import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';

import { ScreenService } from '../services/screen.service';
import { PassLimitService } from '../services/pass-limit.service';
import { HallPassLimit, IndividualPassLimit, IndividualPassLimitCollection } from '../models/HallPassLimits';
import { User } from '../models/User';
import { SPSearchComponent } from '../sp-search/sp-search.component';
import { UserService } from '../services/user.service';
import { IntroData } from '../ngrx/intros';
import { PassLimitInputComponent } from '../pass-limit-input/pass-limit-input.component';
import {
	ConfirmationDialogComponent,
	ConfirmationTemplates,
	RecommendedDialogConfig,
} from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import { NextStep } from '../animations';

// Ensures the school pass limit is between 0 and 50 inclusive
const schoolPassLimitRangeValidator =
	(): ValidatorFn =>
	(form: FormGroup): ValidationErrors => {
		const num = parseInt(form.value['passLimit'], 10);
		if (Number.isNaN(num) || form.value['passLimit'] === '') {
			return { format: true };
		}
		if (num < 0 || num > 50) {
			return { range: true };
		}
		return null;
	};

// Ensures the school pass limit form requests hte pass limit input if the limit is enabled
const limitsRequiredValidator =
	(): ValidatorFn =>
	(form: FormGroup): ValidationErrors => {
		const v = form.value;
		const plValidators = v.limitEnabled
			? [Validators.required, Validators.pattern(/^([1-9]\d*)$|^(0){1}$/)]
			: [Validators.pattern(/^([1-9]\d*)$|^(0){1}$/)];

		form.controls['passLimit'].setValidators(plValidators);

		if (!v.limitEnabled) {
			return null;
		}

		return v === undefined || v === null ? { limitEnabled: true } : null;
	};

// Ensures the school pass limit is between -2 and 50 inclusive
// -2 means Unlimited passes, -1 means no individual limit set
const individualPassLimitRangeValidator =
	(): ValidatorFn =>
	(form: FormGroup): ValidationErrors => {
		if (form.value['passLimit'] === 'Unlimited') {
			return null;
		}
		const num = parseInt(form.value['passLimit'], 10);
		if (Number.isNaN(num)) {
			return { format: true };
		}
		if (num < -2 || num > 50) {
			return { range: true };
		}
		return null;
	};

/**
 * TODOS for pass limits v2
 * TODO: Add fade animation to angular material tabs
 */

@Component({
	selector: 'app-admin-pass-limits-dialog',
	templateUrl: './admin-pass-limits-dialog.component.html',
	styleUrls: ['./admin-pass-limits-dialog.component.scss'],
	animations: [NextStep],
})
export class AdminPassLimitDialogComponent implements OnInit, OnDestroy {
	requestLoading = false;
	contentLoading = true;
	deleteLoading = false;
	hasPassLimit: boolean;
	passLimit: HallPassLimit;
	individualStudentLimits: IndividualPassLimit[] = [];

	// school pass limit form props
	passLimitForm = new FormGroup(
		{
			limitEnabled: new FormControl(false),
			passLimit: new FormControl(null, Validators.pattern(/^([1-9]\d*)$|^(0){1}$/)),
			frequency: new FormControl(null, Validators.required),
		},
		[schoolPassLimitRangeValidator(), limitsRequiredValidator()]
	);
	passLimitFormChanged: Observable<boolean> = of(false);
	passLimitFormLastValue: { limitEnabled: boolean; passLimit: string; frequency: string };
	schoolPassLimitInput: PassLimitInputComponent;

	// individual form props
	individualOverrideForm = new FormGroup(
		{
			students: new FormArray([], Validators.required),
			passLimit: new FormControl(null, [Validators.required, Validators.pattern(/^([1-9]\d*)$|^(0){1}$|^(Unlimited)$/)]),
			description: new FormControl(null),
		},
		individualPassLimitRangeValidator()
	);
	individualFormPreviousValue: { students: string[]; passLimit: string; description: string };
	individualFormChanged: Observable<boolean>;
	individualLoading: boolean;
	selectedExistingIndividualLimit: IndividualPassLimit;
	individualPassLimitInput: PassLimitInputComponent;

	// nux props
	showPassLimitNux: boolean;
	introsData: IntroData;
	introSubs: Subscription;

	// Framer motion controls
	page = 1;
	frameMotion$ = this.formService.getFrameMotionDirection();

	@ViewChild('studentSearch') studentSearcher: SPSearchComponent;
	@ViewChild('deleteDialogBody') deleteDialogBody: TemplateRef<HTMLElement>;
	@ViewChild('schoolPassLimitInput') set setSchoolLimitInput(comp: PassLimitInputComponent) {
		if (!comp) {
			return;
		}

		this.schoolPassLimitInput = comp;
	}
	@ViewChild('individualPassLimitInput') set individualInput(comp: PassLimitInputComponent) {
		if (!comp) {
			return;
		}

		this.individualPassLimitInput = comp;
	}

	constructor(
		private dialog: MatDialog,
		public dialogRef: MatDialogRef<AdminPassLimitDialogComponent>,
		public screenService: ScreenService,
		private passLimitService: PassLimitService,
		private userService: UserService,
		public formService: CreateFormService
	) {}

	ngOnInit(): void {
		/**
		 * Fetch the pass limit and individual limits for the school
		 * If fetching the school-wide pass limit returns null (??), then the school has
		 * no pass limits.
		 * Enabling the pass limit slider creates the pass limit and the user has the option to specify the number
		 * of passes per day that is allowed
		 * «
		 * If the pass limit does not exist, then the slider creates the limit when enabled
		 * If a pass limit already exists, then the slider enables/disables the limit
		 */
		this.passLimitForm.disable();
		forkJoin({
			pl: this.passLimitService.getPassLimit(),
			overrides: this.passLimitService.getIndividualLimits(),
		})
			.pipe(
				concatMap(({ pl, overrides }) => {
					this.hasPassLimit = !!pl.pass_limit;
					if (this.hasPassLimit) {
						this.passLimit = pl.pass_limit;
						this.passLimitForm.patchValue(this.passLimit);
					}
					if (overrides.length) {
						this.individualStudentLimits = overrides;
					}
					return of(true);
				}),
				tap(() => {
					this.passLimitFormLastValue = this.passLimitForm.value;
					this.passLimitFormChanged = this.passLimitForm.valueChanges.pipe(
						map((v) => {
							if (v?.passLimit) {
								v.passLimit = parseInt(v.passLimit, 10);
							}
							const { invalid, dirty } = this.passLimitForm.get('passLimit');
							return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);
						})
					);
					this.passLimitForm.enable();
					this.contentLoading = false;
				})
			)
			.subscribe();

		this.introSubs = this.userService.introsData$.subscribe((intros) => {
			this.introsData = intros;
			this.showPassLimitNux = !intros?.admin_pass_limit_message?.universal?.seen_version;
		});

		this.loadIndividualForm();
	}

	resetPassLimitsForm() {
		this.passLimitForm.patchValue(this.passLimitFormLastValue);
		if (this.schoolPassLimitInput?.passLimitDropdownRef?.getState() === MatDialogState.OPEN) {
			this.schoolPassLimitInput.passLimitDropdownRef.close();
		}
	}

	updatePassLimits() {
		this.requestLoading = true;
		const passLimit = parseInt(this.passLimitForm.value['passLimit'], 10);
		const newValue = {
			...this.passLimit,
			...this.passLimitForm.value,
			passLimit,
		};

		const request = this.hasPassLimit ? this.passLimitService.updatePassLimits(newValue) : this.passLimitService.createPassLimit(newValue);

		request.subscribe({
			next: () => {
				this.hasPassLimit = true;
				this.requestLoading = false;
				this.passLimitFormLastValue = cloneDeep(this.passLimitForm.value);
				this.passLimitFormChanged = this.passLimitForm.valueChanges.pipe(
					map((v) => {
						const { invalid, dirty } = this.passLimitForm.get('passLimit');
						if (v?.passLimit) {
							v.passLimit = parseInt(v.passLimit, 10);
						}
						return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);
					})
				);
			},
			error: () => {
				this.requestLoading = false;
			},
		});
	}

	async onEnabledToggle(change: boolean) {
		await new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 50);
		});
		if (change) {
			if (this.hasPassLimit) {
				this.passLimitForm.patchValue({
					passLimit: `${this.passLimit.passLimit}`,
					frequency: this.passLimit.frequency,
				});
			} else {
				this.passLimitForm.patchValue({
					passLimit: '5',
					frequency: 'day',
				});
			}
		}
	}

	dismissPassLimitNux() {
		this.userService.updateIntrosAdminPassLimitsMessageRequest(this.introsData, 'universal', '1');
		this.showPassLimitNux = false;
	}

	goToIndividualLimitPage(limit?: IndividualPassLimit) {
		this.formService.setFrameMotionDirection();
		setTimeout(() => {
			this.loadIndividualForm(limit);
			this.page = 2;
		}, 100);
	}

	goToHomePage() {
		this.formService.setFrameMotionDirection('back');
		setTimeout(() => {
			this.destroyIndividualForm();
			this.page = 1;
		}, 100);
	}

	// loads individual form with properly parsed values
	// limit param is only truthy when loading an already existing limit
	// most likely, the user wants to edit an individual limit if this is truthy
	private loadIndividualForm(limit?: IndividualPassLimit) {
		this.selectedExistingIndividualLimit = limit || this.selectedExistingIndividualLimit;
		const controls: FormControl[] = [];
		if (!!limit) {
			controls.push(new FormControl(limit.student.id, Validators.required));
		}

		let passLimitValue = limit?.passLimit?.toString();
		if (passLimitValue === '-2') {
			passLimitValue = 'Unlimited';
		}

		this.individualOverrideForm.removeControl('students');
		this.individualOverrideForm.addControl('students', new FormArray(controls));
		this.individualOverrideForm.patchValue({
			passLimit: passLimitValue,
			description: limit?.description || '',
		});
		this.individualFormPreviousValue = this.individualOverrideForm.value;
		this.individualFormChanged = this.individualOverrideForm.valueChanges.pipe(
			map((v) => {
				const { students, passLimit, description } = v;
				const str1 = JSON.stringify(students) + JSON.stringify(passLimit) + JSON.stringify(description);
				const str2 =
					JSON.stringify(this.individualFormPreviousValue?.students) +
					JSON.stringify(this.individualFormPreviousValue?.passLimit) +
					JSON.stringify(this.individualFormPreviousValue?.description);
				return str1 !== str2;
			})
		);
	}

	private destroyIndividualForm() {
		this.individualFormPreviousValue = undefined;
		this.resetIndividualForm();
		this.individualFormChanged = of(false);
		this.selectedExistingIndividualLimit = undefined;
	}

	resetIndividualForm() {
		if (this.studentSearcher) {
			this.studentSearcher.reset();
			this.individualOverrideForm.removeControl('students');
			this.individualOverrideForm.addControl('students', new FormArray([]));
		}
		this.individualOverrideForm.patchValue(
			{
				students: [],
				passLimit: undefined,
				description: '',
			},
			{ emitEvent: true }
		);
		if (this.individualPassLimitInput?.passLimitDropdownRef?.getState() === MatDialogState.OPEN) {
			this.individualPassLimitInput.passLimitDropdownRef.close();
		}
	}

	updateStudentList(selectedUsers: User[]) {
		if (selectedUsers === undefined) {
			this.individualOverrideForm.markAsPristine();
			return;
		}
		this.individualOverrideForm.removeControl('students');
		const controls = selectedUsers.map((u) => new FormControl(u.id));
		this.individualOverrideForm.addControl('students', new FormArray(controls));
		this.individualOverrideForm.markAsDirty();
	}

	submitIndividualLimits() {
		const parsedForm: IndividualPassLimitCollection = {
			students: this.individualOverrideForm.value.students,
			passLimit: this.individualOverrideForm.value.passLimit === 'Unlimited' ? -2 : parseInt(this.individualOverrideForm.value.passLimit, 10),
			description: (this.individualOverrideForm?.value?.description || '').trim(),
		};

		if (parsedForm.students.length === 0) {
			throw new Error('Invalid form: must have at least one student and a properly formatted pass limit string');
		}

		this.individualLoading = true;
		const request = this.selectedExistingIndividualLimit
			? this.passLimitService.updateIndividualLimit({
					...parsedForm,
					description: parsedForm.description || this.selectedExistingIndividualLimit.description,
			  })
			: this.passLimitService.createIndividualLimits(parsedForm);

		request.pipe(concatMap(() => this.passLimitService.getIndividualLimits())).subscribe({
			next: (value) => {
				this.individualStudentLimits = value;
				this.individualLoading = false;
				this.goToHomePage();
			},
		});
	}

	openDeleteDialog() {
		const id = this.individualOverrideForm.value.students[0];
		this.dialog
			.open<ConfirmationDialogComponent, ConfirmationTemplates, boolean>(ConfirmationDialogComponent, {
				...RecommendedDialogConfig,
				width: '450px',
				data: {
					headerText: 'Remove the individual limit?',
					body: this.deleteDialogBody,
					buttons: {
						confirmText: 'Remove limit',
						denyText: 'Cancel',
					},
					templateData: {},
				},
			})
			.afterClosed()
			.pipe(
				filter(Boolean),
				tap(() => (this.deleteLoading = true)),
				concatMap(() => this.passLimitService.removeIndividualLimit(id)),
				concatMap(() => this.passLimitService.getIndividualLimits())
			)
			.subscribe({
				next: (individualLimits) => {
					this.individualStudentLimits = individualLimits;
					this.deleteLoading = false;
					this.goToHomePage();
				},
				error: console.error,
			});
	}

	ngOnDestroy() {
		if (this.introSubs) {
			this.introSubs.unsubscribe();
		}
	}
}
