import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

import {cloneDeep, isEqual} from 'lodash';

import {User} from '../../../models/User';

@Component({
  selector: 'app-student-filter',
  templateUrl: './student-filter.component.html',
  styleUrls: ['./student-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentFilterComponent implements OnInit {

  triggerElementRef: HTMLElement;

  selectedStudents: User[] | Location[] = [];
  initialStudentsArray: User[] | Location[];

  isMultiSelect: boolean;
  update: boolean;

  type: 'selectedStudents' | 'selectedTeachers' | 'rooms';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    public dialogRef: MatDialogRef<StudentFilterComponent>,
  ) { }

  get isUpdate() {
    return !!this.data[this.type] && !!this.data[this.type].length;
  }

  get displayUpdateButton() {
    return this.initialStudentsArray && this.selectedStudents.length && !isEqual(this.selectedStudents, this.initialStudentsArray);
  }

  get showButton() {
    return (!this.isUpdate && this.selectedStudents.length) || (this.isUpdate && this.displayUpdateButton);
  }

  ngOnInit() {
    this.triggerElementRef = this.data['trigger'];
    this.type = this.data['type'];
    this.isMultiSelect = this.data['multiSelect'];
    if (this.data[this.type]) {
      this.selectedStudents = cloneDeep(this.data[this.type]);
      this.initialStudentsArray = cloneDeep(this.data[this.type]);
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
    if (this.isMultiSelect || this.type === 'rooms') {
      this.selectedStudents = students;
    } else {
      this.selectedStudents = students.length ? [students[students.length - 1]] : [];
    }
  }

  saveStudents() {
    this.dialogRef.close({students: this.selectedStudents, type: this.type});
  }

}
