import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {School} from '../../models/School';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {MatDialogRef} from '@angular/material/dialog';
import {MyProfileDialogComponent} from '../my-profile-dialog.component';
import {StorageService} from '../../services/storage.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit {

  @Input() user: User;
  @Input() schools: School[];

  @Output() nextPage: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;
  userAuthType: string;

  constructor(
    private formService: CreateFormService,
    private storage: StorageService,
    public dialogRef: MatDialogRef<MyProfileDialogComponent>,
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.userAuthType = this.storage.getItem('authType');
  }

  checkAccountType(account: User) {
    if (account.sync_types.indexOf('google') !== -1) {
      return 'Connected with G Suite';
    } else if (account.sync_types.indexOf('gg4l') !== -1) {
      return 'Connected with GG4L';
    } else if (!account.sync_types.length) {
      return 'Standard account';
    }
  }

  checkUserRoles(roles: string[]) {
    return roles.reduce((acc, currRole) => {
      if (currRole === '_profile_admin') {
        return [...acc, 'Admin'];
      } else if (currRole === '_profile_teacher') {
        return [...acc, 'Teacher'];
      } else if (currRole === '_profile_student') {
        return [...acc, 'Student'];
      } else if (currRole === '_profile_assistant') {
        return [...acc, 'Assistant'];
      }
      return [...acc];
    }, []).join(', ');
  }

}
