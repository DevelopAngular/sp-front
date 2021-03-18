import {Component, EventEmitter, Inject, Input, OnInit, Optional, Output} from '@angular/core';
import {AdminService} from '../../../../services/admin.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {GG4LSync} from '../../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../../models/SchoolSyncInfo';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../../../animations';
import {CleverInfo} from '../../../../models/CleverInfo';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-ggl4-settings',
  templateUrl: './ggl4-settings.component.html',
  styleUrls: ['./ggl4-settings.component.scss'],
  animations: [NextStep]
})
export class Ggl4SettingsComponent implements OnInit {

  @Input() dialogAction: string;
  @Input() status: string;

  @Output() backEvent: EventEmitter<any> = new EventEmitter<any>();

  gg4lSyncInfo$: Observable<GG4LSync>;
  schoolSyncInfo$: Observable<SchoolSyncInfo>;
  cleverSyncInfo$: Observable<CleverInfo>;
  frameMotion$: BehaviorSubject<any>;

  page: number = 1;

  constructor(
    private adminService: AdminService,
    private formService: CreateFormService,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    @Optional() public dialogRef: MatDialogRef<Ggl4SettingsComponent>,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.data['action']) {
      this.dialogAction = this.data['action'];
      this.status = this.data['status'];
    }
    if (this.status === 'approved' || this.status === 'done') {
      this.page = 2;
    }
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.gg4lSyncInfo$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfo$ = this.adminService.schoolSyncInfo$;
    this.cleverSyncInfo$ = this.adminService.cleverInfoData$;
  }

  nextPage() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 2;
    }, 100);
  }

  back() {
    if (this.status === 'disconnect') {
      this.formService.setFrameMotionDirection('back');
      setTimeout(() => {
        this.page = 1;
      }, 100);
    } else {
      if (this.dialog.getDialogById('gg4lSettings')) {
        this.dialogRef.close();
      } else {
        this.backEvent.emit();
      }
    }
  }
}
