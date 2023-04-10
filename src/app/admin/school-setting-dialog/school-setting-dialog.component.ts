import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { School } from '../../models/School';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { HttpService } from '../../services/http-service';
import * as moment from 'moment';
declare const window;

@Component({
	selector: 'app-school-setting-dialog',
	templateUrl: './school-setting-dialog.component.html',
	styleUrls: ['./school-setting-dialog.component.scss'],
})
export class SchoolSettingDialogComponent implements OnInit, OnDestroy {
	public schoolForm: FormGroup;
	public currentSchool: School;
	private initialState: {
		display_card_room: boolean;
		pass_buffer_time: string | number;
		show_active_passes_number: boolean;
		student_can_use_mobile: boolean;
		wait_in_line: boolean;
		timezone: string;
	};

	public changeForm: boolean;
	public showSpinner: boolean;
	public hideMin: boolean;

	private changeSettings$ = new Subject();
	private destroy$ = new Subject();

	public tzNames: string[];
	public selectedTz: string;

	constructor(private dialogRef: MatDialogRef<SchoolSettingDialogComponent>, private adminService: AdminService, private http: HttpService) {
		this.tzNames = moment.tz.names();
	}

	public ngOnInit(): void {
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
				}),
				filter((res) => !!res)
			)
			.subscribe((res) => {
				this.http.currentSchoolSubject.next(res);
				window.waitForAppLoaded();
				this.dialogRef.close();

				// TODO: (BUG) it opens multiple toasts
				// doublingng the number every time
				/*this.toast.openToast({
            title: 'Success!',
            subtitle: 'Pass Options has successfully changed',
            type: 'success',
          });*/
			});
	}

	public ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private buildForm(school: School): void {
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

	public save(): void {
		this.showSpinner = true;
		this.changeSettings$.next();
	}

	public close(): void {
		this.dialogRef.close();
	}

	public timeZoneChanged(timeZone: string): void {
		this.selectedTz = timeZone;
		this.schoolForm.controls['timezone'].setValue(timeZone);
		this.changeForm = true;
	}
}
