import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateFormService } from '../../../../create-hallpass-forms/create-form.service';
import { GSuiteOrgs } from '../../../../models/GSuiteOrgs';
import { GSuiteSelector } from '../../../../sp-search/sp-search.component';
import { cloneDeep, isEqual } from 'lodash';
import { AdminService } from '../../../../services/admin.service';
import { MatDialogRef } from '@angular/material/dialog';
import { GSuiteSettingsComponent } from '../g-suite-settings.component';

interface OrgUnits {
	path: string;
}
@Component({
	selector: 'app-g-suite-account-link',
	templateUrl: './g-suite-account-link.component.html',
	styleUrls: ['./g-suite-account-link.component.scss'],
})
export class GSuiteAccountLinkComponent implements OnInit {
	@Input() gSuiteInfo: GSuiteOrgs;

	@Output() back: EventEmitter<any> = new EventEmitter<any>();

	users: {
		students: any;
		teachers: any;
		admins: any;
		assistants: any;
	} = {
		students: [],
		teachers: [],
		admins: [],
		assistants: [],
	};

	initialState: any;

	frameMotion$: BehaviorSubject<any>;
	orgUnits: String[] = [];
	orgUnitExistCheck: BehaviorSubject<Boolean> = new BehaviorSubject<boolean>(false);

	get showSave() {
		return !isEqual(this.initialState, this.users);
	}
	saveButtonDisable: Boolean = false;

	constructor(private formService: CreateFormService, private adminService: AdminService, private dialogRef: MatDialogRef<GSuiteSettingsComponent>) {
		this.getLatestOrgUnitList();
	}

	ngOnInit() {
		this.users.students = this.gSuiteInfo.selectors.student.selector.map((sel) => new GSuiteSelector(sel));
		this.users.teachers = this.gSuiteInfo.selectors.teacher.selector.map((sel) => new GSuiteSelector(sel));
		this.users.admins = this.gSuiteInfo.selectors.admin.selector.map((sel) => new GSuiteSelector(sel));
		this.users.assistants = this.gSuiteInfo.selectors.assistant.selector.map((sel) => new GSuiteSelector(sel));
		this.initialState = cloneDeep(this.users);
		this.frameMotion$ = this.formService.getFrameMotionDirection();
		this.orgUnitExistCheck.subscribe((check: Boolean) => {
			this.saveButtonDisable = check;
		});
	}

	getLatestOrgUnitList() {
		this.adminService
			.getGSuiteOrgsUnits()
			.pipe(
				map((res: OrgUnits[]) => {
					return res.map((item) => item.path);
				})
			)
			.subscribe((res) => {
				this.orgUnits = res;
			});
	}

	save() {
		const syncBody = {};
		for (const item in this.users) {
			syncBody[`selector_${item}`] = this.users[item].map((s: GSuiteSelector) => s.as);
		}
		this.adminService.updateSpSyncingRequest(syncBody).subscribe((res) => {
			this.back.emit();
		});
	}
}
