import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {
  NotificationSelectStudentsDialogComponent
} from '../notification-select-students-dialog/notification-select-students-dialog.component';
import {FormArray, FormControl} from '@angular/forms';
import {forkJoin, of, throwError} from 'rxjs';
import {catchError, filter, map, tap} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';

import {ToastService} from '../../services/toast.service';

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
    private toastService: ToastService,
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
        // protect outer forkjoin to unsubscribe on an error of any of its inner observables
        catchError(err => of(err)),
      );
    };

    const requests = this.ids.value.map((id: string|number) => getUser(id));
    // in case of error forkjoin will cancel all inner observables
    forkJoin(requests)
    .pipe(
      tap({
        next: (uu: (User|Error)[]) => {
          this.students = [...uu.filter(u => (u instanceof User))] as User[];
          this.doDisplayedStudents(this.students);

          const httperrors = uu.filter(u => (u instanceof HttpErrorResponse)) as HttpErrorResponse[];
          const errs = uu.filter(u  => (!(u instanceof HttpErrorResponse) && u instanceof Error)) as Error[];
          if (httperrors.length > 0) {
            // trigger tooltip
            const multiple = httperrors.map(err => err.error instanceof Error ? err.error.message : ''+err.error).join("\n");
            if (multiple.length > 0) {
              this.toastService.openToast(
                {
                  title: `Student profiles`,
                  subtitle: `There were errors for ${httperrors.length} profiles.`,
                  type: 'error',
                  showButton: false,
                }
              );
            }
          }
          if (errs.length > 0) {
            const multiple = errs.map(err => err.message).join("\n");
            if (multiple.length > 0) {
              throw new Error(multiple);
            }
          }
        },
      }),
    ).subscribe();
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
