import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {NotificationRoomFormComponent} from '../notification-room-form/notification-room-form.component';
import {MatDialog} from '@angular/material/dialog';
import {
  NotificationSelectStudentsDialogComponent
} from '../notification-select-students-dialog/notification-select-students-dialog.component';
import {Subject} from 'rxjs';
import {FormArray, FormControl} from '@angular/forms';

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
    this.ids.value.forEach(id => {
      this.userService.searchProfileById(id).subscribe(user => {
        this.students.push(user);
      });
    });
  }

  displayedStudents(): StudentDisplay[] {
    return this.students.map<StudentDisplay>(student => {
      return {
        id: student.id,
        name: student.display_name,
        icon: student.profile_picture === null ? './assets/Avatar Default.svg' : student.profile_picture,
      };
    });
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
