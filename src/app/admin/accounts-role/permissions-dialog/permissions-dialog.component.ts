import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {User} from '../../../models/User';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup} from '@angular/forms';
import {cloneDeep, isEqual} from 'lodash';
import {UserService} from '../../../services/user.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Subject, zip} from 'rxjs';

@Component({
  selector: 'app-permissions-dialog',
  templateUrl: './permissions-dialog.component.html',
  styleUrls: ['./permissions-dialog.component.scss']
})
export class PermissionsDialogComponent implements OnInit, OnDestroy {

  selectedUsers: User[];
  profilePermissions = {
    admin: [],
    teacher: [],
    assistant: [],
    student: []
  };
  permissionsForm: FormGroup;
  permissionsInitialState;
  isDirtyForm: boolean;

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public dialogRef: MatDialogRef<PermissionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.selectedUsers = this.data['users'].map(user => User.fromJSON(user));
    this.buildPermissions();

    this.permissionsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.isDirtyForm = !isEqual(this.permissionsInitialState, value);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildPermissions() {
    this.selectedUsers.forEach(user => {
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
      // if (user.isStudent() && !this.profilePermissions.student.length) {
      //   this.profilePermissions.student.push(
      //     {label: 'Make passes without approval', permission: 'pass_approval'}
      //   );
      // }
    });
    const controls = {};
    this.profilePermissions.teacher.concat([...this.profilePermissions.admin, ...this.profilePermissions.assistant]).forEach(perm => {
      controls[perm.permission] = new FormControl(true);
    });
    this.permissionsForm = new FormGroup(controls);
    this.permissionsInitialState = cloneDeep(this.permissionsForm.value);

  }

  getIsPermissionOn(permission) {
    return this.permissionsForm ? this.permissionsForm.get(permission).value : false;
  }

  save() {
    if (this.isDirtyForm) {
      const requests$ = this.selectedUsers.map(user => {
        if (user.isAdmin() && user.isTeacher()) {
          return this.userService
            .createUserRolesRequest(user, this.permissionsForm.value, '_profile_admin')
            .pipe(
              switchMap(() => this.userService
            .createUserRolesRequest(user, this.permissionsForm.value, '_profile_teacher'))
            );
        } else if (user.isAdmin()) {
          return this.userService
            .createUserRolesRequest(user, this.permissionsForm.value, '_profile_admin');
        } else if (user.isTeacher()) {
          return this.userService
            .createUserRolesRequest(user, this.permissionsForm.value, '_profile_teacher');
        } else if (user.isAssistant()) {
          return this.userService
            .createUserRolesRequest(user, this.permissionsForm.value, '_profile_assistant');
        }
      });

      zip(...requests$).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

}
