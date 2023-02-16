import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { School } from '../../models/School';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { HttpService } from '../../services/http-service';
import * as moment from 'moment';

@Component({
	selector: 'app-school-setting-dialog',
	templateUrl: './school-setting-dialog.component.html',
	styleUrls: ['./school-setting-dialog.component.scss'],
})
export class SchoolSettingDialogComponent implements OnInit, OnDestroy {
	schoolForm: FormGroup;
	currentSchool: School;
	initialState: {
		display_card_room: boolean;
		pass_buffer_time: string | number;
		show_active_passes_number: boolean;
		student_can_use_mobile: boolean;
		wait_in_line: boolean;
		timezone: string;
	};

	changeForm: boolean;
	showSpinner: boolean;
	hideMin: boolean;

	changeSettings$ = new Subject();
	destroy$ = new Subject();

	public tzNames: string[];

	public userTz: string;
	public selectedTz: string;

	constructor(private dialogRef: MatDialogRef<SchoolSettingDialogComponent>, private adminService: AdminService, private http: HttpService) {
		this.tzNames = moment.tz.names();
	}

	ngOnInit() {
		this.http.currentSchool$
			.pipe(
				filter((res) => !!res),
				takeUntil(this.destroy$)
			)
			.subscribe((school) => {
				this.currentSchool = school;
				this.buildForm(this.currentSchool);
			});
		this.selectedTz = this.currentSchool.timezone;
		this.initialState = this.schoolForm.value;
		this.schoolForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.changeForm =
				res.display_card_room !== this.initialState.display_card_room ||
				+res.pass_buffer_time !== +this.initialState.pass_buffer_time ||
				res.show_active_passes_number !== this.initialState.show_active_passes_number ||
				res.student_can_use_mobile !== this.initialState.student_can_use_mobile ||
				res.wait_in_line !== this.initialState.wait_in_line;
		});
		this.changeSettings$
			.pipe(
				takeUntil(this.destroy$),
				switchMap(() => {
					return this.adminService.updateSchoolSettingsRequest(this.currentSchool, this.schoolForm.value);
				})
			)
			.subscribe((res) => {
				if (res) {
					this.http.currentSchoolSubject.next(res);
					this.dialogRef.close();
				}

				// TODO: (BUG) it opens multiple toasts
				// doublingng the number every time
				/*this.toast.openToast({
            title: 'Success!',
            subtitle: 'Pass Options has successfully changed',
            type: 'success',
          });*/
			});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	buildForm(school: School) {
		this.schoolForm = new FormGroup({
			display_card_room: new FormControl(school.display_card_room),
			pass_buffer_time: new FormControl(school.pass_buffer_time || 0, [
				Validators.required,
				Validators.pattern('^[0-9]*?[0-9]+$'),
				Validators.max(999),
				Validators.min(0),
			]),
			show_active_passes_number: new FormControl(school.show_active_passes_number),
			student_can_use_mobile: new FormControl(school.student_can_use_mobile),
			wait_in_line: new FormControl(school.feature_flag_wait_in_line),
			timezone: new FormControl(school.timezone),
		});
	}

	save() {
		this.showSpinner = true;
		this.changeSettings$.next();
	}

	close() {
		this.dialogRef.close();
	}

	timeZoneChanged(timeZone: string): void {
		this.selectedTz = timeZone;
		this.schoolForm.controls['timezone'].setValue(timeZone);
		this.changeForm = true;
	}
}
