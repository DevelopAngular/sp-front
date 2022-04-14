import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-pass-limit-dialog',
  templateUrl: './pass-limit-dialog.component.html',
  styleUrls: ['./pass-limit-dialog.component.scss']
})
export class PassLimitDialogComponent implements OnInit {
  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
  showInfoMessage = true; // TODO: hide this message based on database value in the future
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this
  individualLimitsTooltop = `Some help text about individual limits`; // TODO: Get text for this
  individualStudentLimits = [];
  passLimitForm = new FormGroup({ // TODO: disable while fetching the pass limit status
    enable: new FormControl(false) // TODO: get value from server
  });
  individualLimits: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PassLimitDialogComponent>,
    private formService: CreateFormService
  ) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  addIndividualLimit() {

  }
}
