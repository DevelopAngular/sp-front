import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CreateFormService } from '../../../../create-hallpass-forms/create-form.service';
import { GSuiteOrgs } from '../../../../models/GSuiteOrgs';
import {GSuiteSelector} from '../../../../sp-search/sp-search.component';
import {cloneDeep, isEqual} from 'lodash';
import {AdminService} from '../../../../services/admin.service';
import {MatDialogRef} from '@angular/material';
import {GSuiteSettingsComponent} from '../g-suite-settings.component';

@Component({
  selector: 'app-g-suite-account-link',
  templateUrl: './g-suite-account-link.component.html',
  styleUrls: ['./g-suite-account-link.component.scss']
})
export class GSuiteAccountLinkComponent implements OnInit {

  @Input() gSuiteInfo: GSuiteOrgs;

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  users: {
    students: any,
    teachers: any,
    admins: any,
    assistants: any
  } = {
    students: [],
    teachers: [],
    admins: [],
    assistants: []
  };

  initialState: any;

  frameMotion$: BehaviorSubject<any>;

  get showSave() {
    return !isEqual(this.initialState, this.users);
  }

  constructor(
    private formService: CreateFormService,
    private adminService: AdminService,
    private dialogRef: MatDialogRef<GSuiteSettingsComponent>
  ) { }

  ngOnInit() {
    this.users.students = this.gSuiteInfo.selectors.student.selector.map(sel => new GSuiteSelector(sel));
    this.users.teachers = this.gSuiteInfo.selectors.teacher.selector.map(sel => new GSuiteSelector(sel));
    this.users.admins = this.gSuiteInfo.selectors.admin.selector.map(sel => new GSuiteSelector(sel));
    this.users.assistants = this.gSuiteInfo.selectors.assistant.selector.map(sel => new GSuiteSelector(sel));
    this.initialState = cloneDeep(this.users);
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  save() {
    const syncBody = {};
    for (const item in this.users) {
      syncBody[`selector_${item}`] = this.users[item].map((s: GSuiteSelector) => s.as);
    }
    this.adminService.updateSpSyncingRequest(syncBody).subscribe(res => {
      this.dialogRef.close();
    });
  }

}
