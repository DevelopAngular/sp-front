import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AdminService} from '../../../services/admin.service';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {BehaviorSubject, Observable} from 'rxjs';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {Util} from '../../../../Util';
import {CleverInfo} from '../../../models/CleverInfo';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../../animations';

@Component({
  selector: 'app-integrations-dialog',
  templateUrl: './integrations-dialog.component.html',
  styleUrls: ['./integrations-dialog.component.scss'],
  animations: [NextStep]
})
export class IntegrationsDialogComponent implements OnInit {

  gg4lSyncInfo$: Observable<GG4LSync>;
  schoolSyncInfo$: Observable<SchoolSyncInfo>;
  gSuiteOrgs$: Observable<GSuiteOrgs>;
  cleverSyncInfo$: Observable<CleverInfo>;
  cleverSyncLoading$: Observable<boolean>;
  page: number = 1;
  settingsData: {
    action: string,
    status: string
  };

  frameMotion$: BehaviorSubject<any>;

  constructor(
    public dialogRef: MatDialogRef<IntegrationsDialogComponent>,
    private adminService: AdminService,
    public formService: CreateFormService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.gSuiteOrgs$ = this.adminService.gSuiteInfoData$;
    this.gg4lSyncInfo$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfo$ = this.adminService.schoolSyncInfo$;
    this.cleverSyncInfo$ = this.adminService.cleverInfoData$;
    this.cleverSyncLoading$ = this.adminService.cleverSyncLoading$;
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  openSettings(status, action) {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 2;
    }, 100);
    this.settingsData = {action, status};
  }

  back() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      this.page = 1;
      this.settingsData = null;
    }, 100);
  }

  getLastSync(syncInfo: CleverInfo | GG4LSync): string {
    const success = new Date(syncInfo.last_successful_sync);
    const failed = new Date(syncInfo.last_failed_sync);
    if (success > failed) {
      return this.formatDate(success) + ' (Successful)';
    } else {
      return this.formatDate(failed) + ' (Failed)';
    }
  }

}
