import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {filter} from 'rxjs/operators';

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
    limits: new FormControl('5 passes', Validators.pattern(/^((1 pass)|(\d+ passes))$/)),
    frequency: new FormControl('day', Validators.required)
  }); // TODO: disable while fetching the pass limit status
  // enabledControl = new FormControl(false); // TODO: get value from server
  // limitsControl = new FormControl(null, Validators.min(1));  // TODO: get value from server
  individualLimits: any[] = [];
  private frequencyDialogRef: MatDialogRef<HTMLElement, any>;
  showLimitFormatError = false;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<PassLimitDialogComponent>,
    private formService: CreateFormService
  ) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  addIndividualLimit() {

  }

  toggleMainPassLimits(enabled: boolean) {
    this.passLimitForm.patchValue({ enabled });
  }

  triggerFrequencyDialog() {
    const freqButton = document.querySelector('#passLimitFrequencyButton');
    const coords = freqButton.getBoundingClientRect();
    this.frequencyDialogRef = this.dialog.open(this.frequencyPopup, {
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      closeOnNavigation: true,
      restoreFocus: true,
      panelClass: 'pass-limits-frequency-dialog',
      position: {
        top: `${coords.bottom}px`,
        left: `${coords.left}px`
      }
    });
    this.frequencyDialogRef.afterClosed().pipe(filter(Boolean)).subscribe(frequency => {
      this.passLimitForm.patchValue({frequency});
    });
  }

  selectFrequency(frequency: string) {
    this.frequencyDialogRef.close(frequency);
  }
}
