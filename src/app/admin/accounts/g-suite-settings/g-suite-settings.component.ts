import {Component, EventEmitter, OnInit, Optional, Output} from '@angular/core';
import {AdminService} from '../../../services/admin.service';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../../animations';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {takeUntil} from 'rxjs/operators';

enum Pages {
  Info = 1,
  Connect= 2,
  SetUp = 3,
  AccountLink = 4
}

@Component({
  selector: 'app-g-suite-settings',
  templateUrl: './g-suite-settings.component.html',
  styleUrls: ['./g-suite-settings.component.scss'],
  animations: [NextStep]
})
export class GSuiteSettingsComponent implements OnInit {

  @Output() backEvent: EventEmitter<any> = new EventEmitter<any>();

  gSuiteInfo$: Observable<GSuiteOrgs>;
  currentPage: Pages;

  frameMotion$: BehaviorSubject<any>;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private adminService: AdminService,
    private formService: CreateFormService,
    @Optional() public dialogRef: MatDialogRef<GSuiteSettingsComponent>,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.gSuiteInfo$ = this.adminService.gSuiteInfoData$;

    this.gSuiteInfo$.pipe(takeUntil(this.destroy$)).subscribe(info => {
      if (info.is_enabled) {
        this.currentPage = 3;
      } else {
        this.currentPage = 1;
      }
    });
  }

  nextPage() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.currentPage += 1;
    }, 100);
  }

  back() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      this.currentPage -= 1;
    }, 100);
  }
}
