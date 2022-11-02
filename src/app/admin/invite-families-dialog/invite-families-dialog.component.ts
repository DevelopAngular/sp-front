import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { NextStep } from '../../animations';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { ParentAccountService } from '../../services/parent-account.service';

@Component({
  selector: 'app-invite-families-dialog',
  templateUrl: './invite-families-dialog.component.html',
  styleUrls: ['./invite-families-dialog.component.scss'],
  animations: [NextStep]
})
export class InviteFamiliesDialogComponent implements OnInit {

  inviteForm: FormGroup;
  parentsMetrics: any;

  frameMotion$: BehaviorSubject<any>;

  constructor(
    public dialogRef: MatDialogRef<InviteFamiliesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    public formService: CreateFormService,
    private parentService: ParentAccountService
  ) { }

  ngOnInit(): void {
    this.inviteForm = new FormGroup({
      auto_invite: new FormControl()
    });

    this.frameMotion$ = this.formService.getFrameMotionDirection();

    this.parentService.getParentsMetrics().subscribe({
      next: (result: any) => {
        this.parentsMetrics = result.results;
      },
      error: (error: any) => {
        console.log("Error : ", error);

      }
    });

  }

  back() {
    this.dialogRef.close();
  }

  getUnconnectedStudents() {
    this.parentService.getUnconnectedStudents();
  }

  getInviteCodes() {
    this.parentService.getStudentInviteCode();
  }

}
