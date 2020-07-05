import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';

import { isEqual, cloneDeep } from 'lodash';

import { User } from '../../../models/User';

@Component({
  selector: 'app-student-filter',
  templateUrl: './student-filter.component.html',
  styleUrls: ['./student-filter.component.scss']
})
export class StudentFilterComponent implements OnInit {

  triggerElementRef: HTMLElement;

  selectedStudents: User[] = [];

  initialStudentsArray: User[];

  update: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<StudentFilterComponent>
  ) { }

  get isUpdate() {
    return !!this.data['selectedStudents'] && !!this.data['selectedStudents'].length;
  }

  get displayUpdateButton() {
    return this.initialStudentsArray && !isEqual(this.selectedStudents, this.initialStudentsArray);
  }

  get showButton() {
    return (!this.isUpdate && this.selectedStudents.length) || (this.isUpdate && this.displayUpdateButton);
  }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    if (this.data['selectedStudents']) {
      this.selectedStudents = cloneDeep(this.data['selectedStudents']);
      this.initialStudentsArray = cloneDeep(this.data['selectedStudents']);
    }
    this.updateDialogPosition();
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 13}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  updateStudents(students) {
    this.selectedStudents = students;
  }

  saveStudents() {
    this.dialogRef.close(this.selectedStudents);
  }

}
