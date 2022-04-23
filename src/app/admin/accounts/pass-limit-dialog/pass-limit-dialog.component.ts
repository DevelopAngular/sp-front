import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NextStep} from '../../../animations';
import {ScreenService} from '../../../services/screen.service';
import {PassLimitService} from '../../../services/pass-limit.service';

/**
 * TODOS for individual pass limits
 * TODO: Add student label with Student search
 * TODO: Hook up output of student search component with new individual limit form
 * TODO: Make the number of limits input into it's own component
 * TODO: Put a Number of limits per day
 * TODO: Put the description input
 * TODO: Hook up inputs to forms
 * TODO: Put the save button on the top right of the new individual form header
 * TODO: Create shared component for pass limit drop down
 */

@Component({
  selector: 'app-pass-limit-dialog',
  templateUrl: './pass-limit-dialog.component.html',
  styleUrls: ['./pass-limit-dialog.component.scss'],
  animations: [NextStep]
})
export class PassLimitDialogComponent implements OnInit {
  // TODO: This is for when multiple pass frequencies are implemented
  // @ViewChild('passLimitsFrequencyDialog') frequencyPopup: TemplateRef<HTMLElement>;

  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
  showInfoMessage = true; // TODO: hide this message based on database value in the future
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this
  individualLimitsTooltop = `Some help text about individual limits`; // TODO: Get text for this
  individualStudentLimits = [];

  passLimitForm = new FormGroup({
    enabled: new FormControl(false),
    limits: new FormControl('5 passes', Validators.pattern(/^((1 pass)|(\d+ passes))$/)),
    frequency: new FormControl('day', Validators.required)
  }); // TODO: disable while fetching the pass limit status
  showLimitFormatError = false;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<PassLimitDialogComponent>,
    public screenService: ScreenService,
    private formService: CreateFormService,
    private passLimit: PassLimitService
  ) { }

  ngOnInit(): void {
    this.passLimitForm.disable();
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.passLimit.getPassLimit().subscribe(pl => {
      this.passLimitForm.patchValue({
        enabled: pl.limitEnabled,
        limits: pl.passLimit,
        frequency: pl.frequency
      });
      this.passLimitForm.enable();
    });
  }

  toggleMainPassLimits(enabled: boolean) {
    this.passLimitForm.patchValue({ enabled });
  }

  // TODO: This is for when multiple pass frequencies are implemented
  // triggerFrequencyDialog() {
  //   const freqButton = document.querySelector('#passLimitFrequencyButton');
  //   const coords = freqButton.getBoundingClientRect();
  //   this.frequencyDialogRef = this.dialog.open(this.frequencyPopup, {
  //     hasBackdrop: true,
  //     backdropClass: 'cdk-overlay-transparent-backdrop',
  //     closeOnNavigation: true,
  //     restoreFocus: true,
  //     panelClass: 'pass-limits-frequency-dialog',
  //     position: {
  //       top: `${coords.bottom}px`,
  //       left: `${coords.left}px`
  //     }
  //   });
  //   this.frequencyDialogRef.afterClosed().pipe(filter(Boolean)).subscribe(frequency => {
  //     this.passLimitForm.patchValue({frequency});
  //   });
  // }

  // TODO: This is for when multiple pass frequencies are implemented
  // selectFrequency(frequency: string) {
  //   this.frequencyDialogRef.close(frequency);
  // }
}
