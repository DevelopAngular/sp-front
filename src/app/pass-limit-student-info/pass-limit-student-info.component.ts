import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StudentPassLimit} from '../models/HallPassLimits';

@Component({
  selector: 'app-pass-limit-student-info',
  templateUrl: './pass-limit-student-info.component.html',
  styleUrls: ['./pass-limit-student-info.component.scss']
})
export class PassLimitStudentInfoComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { studentPassLimit: StudentPassLimit },
    private dialogRef: MatDialogRef<PassLimitStudentInfoComponent>,
  ) { }

  ngOnInit(): void {
  }

}
