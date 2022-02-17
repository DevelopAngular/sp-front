import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {User} from '../models/User';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AdminService} from '../services/admin.service';
import {NextStep} from '../animations';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DeviceDetection} from '../device-detection.helper';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
  animations: [NextStep]
})
export class ReportFormComponent implements OnInit {

  @ViewChild('messageBox') set content(content: ElementRef) {
    if (content) {
      content.nativeElement.focus();
    }
  }

  frameMotion$;
  formState = 'studentSelect';
  selectedStudents: User[] = [];
  showOptions = true;
  reportMessage = '';


  constructor(
              private adminService: AdminService,
              private dialogRef: MatDialogRef<ReportFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private createForm: CreateFormService,
              private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.frameMotion$ = this.createForm.getFrameMotionDirection();
     if (this.data) {
       this.selectedStudents.push(this.data['report']);
         this.showOptions = !this.data['report'];
     }
  }
  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  getBackground(item) {
    if (item.hovered) {
      if (item.pressed) {
        return '#E2E7F4';
      } else {
        return '#ECF1FF';
      }
    } else {
      return '#FFFFFF';
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

    this.adminService.sendReportRequest(body).pipe(filter(res => !!res)).subscribe(data => {
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

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
