import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {
  NotificationSelectStudentsDialogComponent
} from '../notification-select-students-dialog/notification-select-students-dialog.component';
import {FormArray, FormControl} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

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
    const getUser = id => { 
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

    forkJoin(this.ids.value.map(id => getUser(id))).pipe(take(1)).subscribe(
      (uu: User[]) => {
        this.students = [...uu];
      });
  }

  displayedStudents(): StudentDisplay[] {
    if (this.students.length === 0) {
      return;
    }

    const ss = this.students.map<StudentDisplay>(student => {
      return {
        id: student.id,
        name: student.display_name,
        icon: student.profile_picture === null ? './assets/Avatar Default.svg' : student.profile_picture,
      };
    });

    return ss;
  }

  removeStudent(studentIndex) {
    this.students.splice(studentIndex, 1);
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
      this.ids.push(new FormControl(newStudent[0].id));
      console.log(this.students, this.ids);
    });
  }
}
