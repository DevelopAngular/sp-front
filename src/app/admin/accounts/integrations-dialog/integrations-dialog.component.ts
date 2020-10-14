import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AdminService} from '../../../services/admin.service';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {Observable} from 'rxjs';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {Util} from '../../../../Util';

@Component({
  selector: 'app-integrations-dialog',
  templateUrl: './integrations-dialog.component.html',
  styleUrls: ['./integrations-dialog.component.scss']
})
export class IntegrationsDialogComponent implements OnInit {

  gg4lSyncInfo$: Observable<GG4LSync>;
  schoolSyncInfo$: Observable<SchoolSyncInfo>;
  gSuiteOrgs$: Observable<GSuiteOrgs>;

  constructor(
    public dialogRef: MatDialogRef<IntegrationsDialogComponent>,
    private adminService: AdminService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.gSuiteOrgs$ = this.adminService.gSuiteInfoData$;
    this.gg4lSyncInfo$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfo$ = this.adminService.schoolSyncInfo$;
  }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  openSettings(status, action) {
    this.dialogRef.close({action, status});
  }

}