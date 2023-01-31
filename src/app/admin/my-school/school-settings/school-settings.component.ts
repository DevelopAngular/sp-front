import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpService } from '../../../services/http-service';
import * as moment from 'moment';
import { School } from '../../../models/School';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { TimeZoneService } from '../../../services/time-zone.service';

@Component({
	selector: 'app-school-settings',
	templateUrl: './school-settings.component.html',
	styleUrls: ['./school-settings.component.scss'],
})
export class SchoolSettingsComponent implements OnInit, OnDestroy {
	schoolForm: FormGroup;
	school: any;

	changeForm: boolean;
	showSpinner: boolean;

	changeSettings$: Subject<any> = new Subject<any>();

	public tzNames: string[];

	public userTz: string;
	public selectedTz: string;

	destroy$ = new Subject();

	constructor(
		private http: HttpService,
		private dialogRef: MatDialogRef<SchoolSettingsComponent>,
		private adminService: AdminService,
		@Inject('TimeZoneService') private timeZoneService: TimeZoneService
	) {
		this.tzNames = moment.tz.names();
	}

	ngOnInit() {
		this.http.currentSchool$.pipe(takeUntil(this.destroy$)).subscribe((school: School) => {
			this.school = {
				...school,
				name: school.name,
				created: moment(school.created).format('MMMM DD, YYYY'),
			};
			// this.timeZoneChanged(this.school.timezone)
			this.selectedTz = this.school.timezone;
			this.schoolForm = new FormGroup({
				name: new FormControl(school.name),
				display_username: new FormControl(school.display_username),
				timezone: new FormControl(school.timezone),
			});
		});

		this.schoolForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((res) => {
			this.changeForm =
				res.name !== this.school.name || res.display_username !== this.school.display_username || res.timezone !== this.school.timezone;
		});

		this.changeSettings$
			.pipe(
				takeUntil(this.destroy$),
				switchMap(() => {
					return this.adminService.updateSchoolSettingsRequest(this.school, {
						...this.schoolForm.value,
						pass_buffer_time: this.school.pass_buffer_time,
						display_card_room: this.school.display_card_room,
					});
				}),
				filter((res) => !!res)
			)
			.subscribe((res) => {
				this.http.currentSchoolSubject.next(res);
				this.dialogRef.close();
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	close() {
		this.dialogRef.close();
	}

	save() {
		this.showSpinner = true;
		this.changeSettings$.next();
	}

	timeZoneChanged(timeZone: string): void {
		this.selectedTz = timeZone;
		this.schoolForm.controls['timezone'].setValue(timeZone);
	}
}
