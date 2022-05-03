import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NextStep} from '../../../animations';
import {ScreenService} from '../../../services/screen.service';
import {PassLimitService} from '../../../services/pass-limit.service';
import {map} from 'rxjs/operators';
import {HallPassLimit} from '../../../models/HallPassLimits';

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
  selector: 'app-admin-pass-limits-dialog',
  templateUrl: './admin-pass-limits-dialog.component.html',
  styleUrls: ['./admin-pass-limits-dialog.component.scss'],
  animations: [NextStep]
})
export class AdminPassLimitDialogComponent implements OnInit {
  // TODO: This is for when multiple pass frequencies are implemented

  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
  showInfoMessage = true; // TODO: hide this message based on database value in the future
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this
  individualLimitsTooltop = `Some help text about individual limits`; // TODO: Get text for this
  individualStudentLimits = [];
  hasPassLimit: boolean;
  passLimit: HallPassLimit;
  passLimitForm = new FormGroup({
    enabled: new FormControl(false),
    limits: new FormControl(null, Validators.pattern(/^((1 pass)|(((1\d+)|[2-9]\d*) passes))$/)),
    frequency: new FormControl(null, Validators.required)
  }); // TODO: disable while fetching the pass limit status
  passLimitFormSubs: Subscription;
  passLimitFormChanged: Observable<boolean> = of(false);
  passLimitFormLastValue: {enabled: boolean, limits: string, frequency: string};
  showLimitFormatError = false;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AdminPassLimitDialogComponent>,
    public screenService: ScreenService,
    private formService: CreateFormService,
    private passLimitService: PassLimitService
  ) { }

  ngOnInit(): void {
    /**
     * Fetch the pass limit and individual limits for the school
     * If fetching the school-wide pass limit returns null (??), then the school has
     * no pass limits.
     * Enabling the pass limit slider creates the pass limit and the user has the option to specify the number
     * of passes per day that is allowed
     * «
     * If the pass limit does not exist, then the slider creates the limit when enabled
     * If a pass limit already exists, then the slider enables/disables the limit
     */

    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.passLimitFormSubs = this.passLimitForm.valueChanges.subscribe((v) => {
      v.enabled
        ? this.passLimitForm.controls['limits'].setValidators([Validators.required, Validators.pattern(/^((1 pass)|(((1\d+)|[2-9]\d*) passes))$/)])
        : this.passLimitForm.controls['limits'].setValidators([Validators.pattern(/^((1 pass)|(((1\d+)|[2-9]\d*) passes))$/)]);
    });
    this.passLimitForm.disable();
    this.passLimitService.getPassLimit().subscribe({
      next: pl => {
        this.hasPassLimit = pl.pass_limit !== null;
        if (this.hasPassLimit) {
          const { pass_limit } = pl;
          this.passLimit = pass_limit;
          this.passLimitForm.patchValue({
            limits: `${pass_limit.passLimit} passes`,
            enabled: true,
            frequency: pass_limit.frequency
          });
        }
        this.passLimitFormLastValue = this.passLimitForm.value;
        this.passLimitFormChanged = this.passLimitForm.valueChanges.pipe(
          map(v => {
            this.showLimitFormatError = this.passLimitForm.get('limits').invalid && this.passLimitForm.get('limits').dirty;
            return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);
          }));
        this.passLimitForm.enable();
      },
    });
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
  resetPassLimitsForm() {
    this.passLimitForm.patchValue(this.passLimitFormLastValue);
  }

  updatePassLimits() {
    if (this.hasPassLimit) {
      // update put request
      // this.passLimitService.updatePassLimits({
      //   ...this.passLimit,
      //   ...this.passLimitForm.value
      // }).subscribe();
      console.log('Updating current pass limit');
    } else {
      console.log('Creating new pass limit');
      // create post request5
      // set hasPassLimit to true afterwards
    }

  }

  onEnabledToggle(change: boolean) {
    if (!this.hasPassLimit) {
      if (change) {
        this.passLimitForm.patchValue({
          frequency: 'day'
        });
      } else {
        this.passLimitForm.reset();
      }
    }
  }
}
