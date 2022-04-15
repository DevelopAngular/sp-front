import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-pass-limit-dialog',
  templateUrl: './pass-limit-dialog.component.html',
  styleUrls: ['./pass-limit-dialog.component.scss']
})
export class PassLimitDialogComponent implements OnInit {
  @ViewChild('passLimitsFrequencyDialog') frequencyPopup: TemplateRef<HTMLElement>;

  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
  showInfoMessage = true; // TODO: hide this message based on database value in the future
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this
  individualLimitsTooltop = `Some help text about individual limits`; // TODO: Get text for this
  individualStudentLimits = [];

  passLimitForm = new FormGroup({
    enabled: new FormControl(false),
    limits: new FormControl(null, Validators.min(1)),
    frequency: new FormControl('week', Validators.required)
  }); // TODO: disable while fetching the pass limit status
  // enabledControl = new FormControl(false); // TODO: get value from server
  // limitsControl = new FormControl(null, Validators.min(1));  // TODO: get value from server
  individualLimits: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PassLimitDialogComponent>,
    private formService: CreateFormService
  ) { }

  ngOnInit(): void {
    // this.passLimitForm.addControl('enabled', this.enabledControl);
    // this.passLimitForm.addControl('limits', this.limitsControl);
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  addIndividualLimit() {

  }

  toggleMainPassLimits(enabled: boolean) {
    this.passLimitForm.patchValue({ enabled });
  }
}
