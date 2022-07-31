import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StudentPassLimit} from '../models/HallPassLimits';
import {User} from '../models/User';

@Component({
  selector: 'app-pass-limit-student-info',
  templateUrl: './pass-limit-student-info.component.html',
  styleUrls: ['./pass-limit-student-info.component.scss']
})
export class PassLimitStudentInfoComponent implements OnInit {
  isAdmin: boolean;
  individualEditButton: boolean;
  schoolEditButton: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { studentPassLimit: StudentPassLimit, user: User },
    private dialogRef: MatDialogRef<PassLimitStudentInfoComponent>,
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.data.user.roles.includes('manage_school');
    console.log(this.data.studentPassLimit);
    this.schoolEditButton = this.data.studentPassLimit.schoolPassLimitEnabled;
    this.individualEditButton = this.data.studentPassLimit.isIndividual;
  }

  clicker() {
    console.log('click');
  }

}
