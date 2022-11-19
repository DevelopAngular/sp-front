import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AdminService} from '../../../services/admin.service';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {BehaviorSubject, merge, Observable, of, Subject} from 'rxjs';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {Util} from '../../../../Util';
import {CleverInfo} from '../../../models/CleverInfo';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../../animations';
import {UserService} from '../../../services/user.service';
import {filter, takeUntil} from 'rxjs/operators';
import { ClassLinkInfo } from '../../../models/ClassLinkInfo';

@Component({
  selector: 'app-integrations-dialog',
  templateUrl: './integrations-dialog.component.html',
  styleUrls: ['./integrations-dialog.component.scss'],
  animations: [NextStep]
})
export class IntegrationsDialogComponent implements OnInit, OnDestroy {

  schoolSyncInfo$: Observable<SchoolSyncInfo>;
  gSuiteOrgs$: Observable<GSuiteOrgs>;
  cleverSyncInfo$: Observable<CleverInfo>;
  cleverSyncLoading$: Observable<boolean>;
  classlinkSyncLoading$: Observable<boolean>;
  classlinkSyncInfo$: Observable<ClassLinkInfo>;
  page: number = 1;
  settingsData: {
    action: string,
    status: string
  };
  isUploadedProfilePictures: boolean;
  isUploadedGradeLevels: boolean;
  isUploadedIDNumbers: boolean;
  classLinkSyncData:any

  frameMotion$: BehaviorSubject<any>;

  destroy$ = new Subject();

  constructor(
    public dialogRef: MatDialogRef<IntegrationsDialogComponent>,
    private adminService: AdminService,
    public formService: CreateFormService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.gSuiteOrgs$ = this.adminService.gSuiteInfoData$;
    this.schoolSyncInfo$ = this.adminService.schoolSyncInfo$;
    this.cleverSyncInfo$ = this.adminService.cleverInfoData$;
    this.cleverSyncLoading$ = this.adminService.syncLoading$;
    this.classlinkSyncLoading$ = this.adminService.syncLoading$;
    this.classlinkSyncInfo$ = this.adminService.classLinkInfoData$
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    //this has been moved tp picture-profile component
    //this.userService.getUploadedGroupsRequest();

    merge(of(this.userService.getUserSchool()), this.userService.getCurrentUpdatedSchool$().pipe(filter(s => !!s)))
        .pipe(takeUntil(this.destroy$))
        .subscribe(school => {
          this.isUploadedProfilePictures = school.profile_pictures_completed;
        });

        this.userService.getStatusOfGradeLevel().subscribe({
          next: (result: any) => {
            if (result?.results?.setup) {
              this.isUploadedGradeLevels = true;
            }
          }
        });

        this.userService.getStatusOfIDNumber().subscribe({
          next: (result: any) => {
            if (result?.results?.setup) {
              this.isUploadedIDNumbers = true;
            }
          }
        })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
