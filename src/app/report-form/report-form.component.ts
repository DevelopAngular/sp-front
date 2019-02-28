import { Component, OnInit, Inject } from '@angular/core';
import { User } from '../models/User';
import { HttpService } from '../services/http-service';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';
import {AdminService} from '../services/admin.service';
import {showReportDialog} from '@sentry/browser';
import {NextStep} from '../animations';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
  animations: [NextStep]
})
export class ReportFormComponent implements OnInit {
  frameMotion$;
  formState: string = 'studentSelect';
  selectedStudents: User[] = [];
  showOptions: boolean = true;
  reportMessage: string = '';

  constructor(private http: HttpService,
              private adminService: AdminService,
              private dialogRef: MatDialogRef<ReportFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private createForm: CreateFormService
  ) {}

  ngOnInit() {
    this.frameMotion$ = this.createForm.getFrameMotionDirection();
    this.dialogRef.updatePosition({top: '120px'});
     if (this.data) {
       this.selectedStudents.push(this.data['report']);
         this.showOptions = !this.data['report'];
     }
  }

  setFormState(state: string) {
    this.formState = state;
    this.showOptions = this.formState === 'studentSelect';
  }

  sendReport() {
    const body = {
      'students' : this.selectedStudents.map(user => user.id),
      'message' : this.reportMessage
    };

    this.adminService.sendReport(body).subscribe(data => {
      console.log(data);
      this.dialogRef.close(data);
    });
  }

  nextStep() {
    this.createForm.setFrameMotionDirection('forward');
    setTimeout(() => {
      this.showOptions = false;
    }, 100);
  }
  back() {
    this.createForm.setFrameMotionDirection('back');
    setTimeout(() => {
      if (!this.showOptions) {
        this.showOptions = true;
      } else {
        this.dialogRef.close(null);
      }
    }, 100);

  }
}
