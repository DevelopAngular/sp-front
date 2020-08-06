import {Component, Inject, OnInit} from '@angular/core';
import {AdminService} from '../../../services/admin.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../../animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-ggl4-settings',
  templateUrl: './ggl4-settings.component.html',
  styleUrls: ['./ggl4-settings.component.scss'],
  animations: [NextStep]
})
export class Ggl4SettingsComponent implements OnInit {

  gg4lSyncInfo$: Observable<GG4LSync>;
  schoolSyncInfo$: Observable<SchoolSyncInfo>;
  frameMotion$: BehaviorSubject<any>;

  page: number = 1;

  constructor(
    private adminService: AdminService,
    private formService: CreateFormService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<Ggl4SettingsComponent>
  ) { }

  ngOnInit() {
    if (this.data['status'] === 'approved' || this.data['status'] === 'done') {
      this.page = 2;
    }
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.gg4lSyncInfo$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfo$ = this.adminService.schoolSyncInfo$;
  }

  nextPage() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 2;
    }, 100);
  }

  back() {
    if (this.data['status'] === 'disconnect') {
      this.formService.setFrameMotionDirection('back');
      setTimeout(() => {
        this.page = 1;
      }, 100);
    } else {
      this.dialogRef.close();
    }
  }
}
