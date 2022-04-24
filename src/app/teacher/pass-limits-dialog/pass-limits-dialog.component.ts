import {Component, Inject, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ScreenService} from '../../services/screen.service';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {PassLimitService} from '../../services/pass-limit.service';
import {NextStep} from '../../animations';
import {User} from '../../models/User';

// TODO: Create some sort of API/service for dialogs that have multiple pages

@Component({
  selector: 'app-pass-limits-dialog',
  templateUrl: './pass-limits-dialog.component.html',
  styleUrls: ['./pass-limits-dialog.component.scss'],
  animations: [NextStep]
})
export class PassLimitsDialogComponent implements OnInit {
  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this

  constructor(
    public dialogRef: MatDialogRef<PassLimitsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { profile: User },
    public screenService: ScreenService,
    private formService: CreateFormService,
    private passLimit: PassLimitService
  ) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

}
