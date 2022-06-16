import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {NotificationRoomFormComponent} from '../notification-room-form/notification-room-form.component';
import {MatDialog} from '@angular/material/dialog';
import {
  NotificationSelectStudentsDialogComponent
} from '../notification-select-students-dialog/notification-select-students-dialog.component';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-notification-select-students',
  templateUrl: './notification-select-students.component.html',
  styleUrls: ['./notification-select-students.component.scss']
})
export class NotificationSelectStudentsComponent implements OnInit {

  @Output() update = new EventEmitter();
  students: User[] = [];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.update.emit(this.students);
  }

  updateStudents() {
    this.update.emit(
      this.students.map(student => {
        console.log(student.profile_picture === undefined ? './assets/Avatar Default.svg' : student.profile_picture);
        return {
          id: student.id,
          name: student.display_name,
          icon: student.profile_picture === null ? './assets/Avatar Default.svg' : student.profile_picture,
        };
      })
    );
  }

  removeStudent(studentIndex) {
    this.students.splice(studentIndex, 1);
    this.updateStudents();
  }

  beginSearch() {
    const dialog = this.dialog.open(NotificationSelectStudentsDialogComponent, {
      panelClass: 'form-dialog-container',
      backdropClass: 'custom-backdrop',
      height: '285px',
      width: '450px',
    });

    dialog.afterClosed().subscribe(newStudent => {
      if (newStudent === undefined || newStudent.length !== 1) {
        return;
      }

      if (this.students.some(s => s.id === newStudent[0].id)) {
        return;
      }

      this.students.push(newStudent[0]);
      this.updateStudents();
    });
  }
}
