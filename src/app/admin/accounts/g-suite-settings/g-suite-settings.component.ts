import {Component, EventEmitter, OnInit, Optional, Output} from '@angular/core';
import {AdminService} from '../../../services/admin.service';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {BehaviorSubject, Observable} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../../animations';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-g-suite-settings',
  templateUrl: './g-suite-settings.component.html',
  styleUrls: ['./g-suite-settings.component.scss'],
  animations: [NextStep]
})
export class GSuiteSettingsComponent implements OnInit {

  @Output() backEvent: EventEmitter<any> = new EventEmitter<any>();

  gSuiteInfo$: Observable<GSuiteOrgs>;
  isEditMode: boolean;

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private adminService: AdminService,
    private formService: CreateFormService,
    @Optional() public dialogRef: MatDialogRef<GSuiteSettingsComponent>,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.gSuiteInfo$ = this.adminService.gSuiteInfoData$;
  }

  nextPage() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.isEditMode = true;
    }, 100);
  }

  back() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      this.isEditMode = false;
    }, 100);
  }
}
