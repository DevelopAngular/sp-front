import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {
  NotificationSelectStudentsDialogComponent
} from '../notification-select-students-dialog/notification-select-students-dialog.component';
import {FormArray, FormControl} from '@angular/forms';
import {forkJoin, throwError} from 'rxjs';
import {filter, map} from 'rxjs/operators';

interface StudentDisplay {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-notification-select-students',
  templateUrl: './notification-select-students.component.html',
  styleUrls: ['./notification-select-students.component.scss']
})
export class NotificationSelectStudentsComponent implements OnInit {

  @Input() ids: FormArray;

  students: User[] = [];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const getUser = (id: string|number) => {
      return this.userService.searchProfileById(id)
      .pipe(
        filter(Boolean),
        map(user => {
          try {
            const u: User = User.fromJSON(user);
            return u;
          } catch (e) {
            return false;
          }
        }),
        filter(Boolean),
      );
    };
    const requests = this.ids.value.map((id: string|number) => getUser(id));
    requests.push(throwError('error'))
    forkJoin(requests).subscribe({
      next: (uu: User[]) => {
        this.students = [...uu];
        this.doDisplayedStudents(this.students);
      },
      error: err => {throw err;},
    });
  }

  // represents this.students inside template
  // it is this.students twin that lives only for template
  // every change to this.students in order to have effect on template
  // MUST be paired with a call to this.doDisplayedStudents
  displayedStudents: StudentDisplay[] = [];

  // formatting data for template
  doDisplayedStudents(students: User[]): void {
    if (students.length === 0) {
      this.displayedStudents = [];
      return;
    }

    const ss = students.map<StudentDisplay>(student => {
      return {
        id: student.id,
        name: student.display_name,
        icon: student.profile_picture === null ? './assets/Avatar Default.svg' : student.profile_picture,
      };
    });

    this.displayedStudents = ss;
  }

  removeStudent(studentIndex: number) {
    this.students.splice(studentIndex, 1);
    this.doDisplayedStudents(this.students);
    this.ids.removeAt(studentIndex);
  }

  beginSearch() {
    const dialog = this.dialog.open(NotificationSelectStudentsDialogComponent, {
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      height: '285px',
      width: '450px',
    });

    dialog.afterClosed().subscribe((newStudent: User[]) => {
      if (newStudent === undefined || newStudent.length !== 1) {
        return;
      }

      if (this.students.some(s => s.id === newStudent[0].id)) {
        return;
      }

      this.students.push(newStudent[0]);
      this.doDisplayedStudents(this.students);
      this.ids.push(new FormControl(newStudent[0].id));
      console.log(this.students, this.ids);
    });
  }
}
