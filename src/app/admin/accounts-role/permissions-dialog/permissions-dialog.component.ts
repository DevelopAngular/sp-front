import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../../../models/User';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-permissions-dialog',
  templateUrl: './permissions-dialog.component.html',
  styleUrls: ['./permissions-dialog.component.scss']
})
export class PermissionsDialogComponent implements OnInit {

  selectedUsers: User[];
  profilePermissions = {
    admin: [],
    teacher: [],
    assistant: []
  };
  permissionsForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<PermissionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.selectedUsers = this.data['users'];
    this.buildPermissions();
  }

  buildPermissions() {
    this.selectedUsers.forEach(user => {
      user = User.fromJSON(user);
      if (user.isTeacher() && !this.profilePermissions.teacher.length) {
        this.profilePermissions.teacher.push(
          {label: 'Passes', permission: 'access_passes', icon: 'Passes'},
          {label: 'Hall Monitor', permission: 'access_hall_monitor', icon: 'Walking'},
          {label: 'My Room', permission: 'access_teacher_room', icon: 'Room'}
        );
      }
      if (user.isAdmin() && !this.profilePermissions.admin.length) {
        this.profilePermissions.admin.push(
          {label: 'Dashboard', permission: 'access_admin_dashboard', icon: 'Dashboard'},
          {label: 'Hall Monitor', permission: 'admin_hall_monitor', icon: 'Walking'},
          {label: 'Explore', permission: 'access_admin_search', icon: 'Search Eye'},
          {label: 'Rooms', permission: 'access_pass_config', icon: 'Room'},
          {label: 'Accounts', permission: 'access_user_config', icon: 'Users'}
        );
      }
      if (user.isAssistant() && !this.profilePermissions.assistant.length) {
        this.profilePermissions.assistant.push(
          {label: 'Passes', permission: 'access_passes', icon: 'Passes'},
          {label: 'Hall Monitor', permission: 'access_hall_monitor', icon: 'Walking'},
          {label: 'My Room', permission: 'access_teacher_room', icon: 'Room'}
        );
      }
    });
    const controls = {};
    this.profilePermissions.teacher.concat([...this.profilePermissions.admin, ...this.profilePermissions.assistant]).forEach(perm => {
      controls[perm.permission] = new FormControl(true);
    });
    this.permissionsForm = new FormGroup(controls);

  }

}
