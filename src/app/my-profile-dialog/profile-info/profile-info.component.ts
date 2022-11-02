import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../models/User';
import {School} from '../../models/School';
import {BehaviorSubject, Subject} from 'rxjs';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MyProfileDialogComponent} from '../my-profile-dialog.component';
import {StorageService} from '../../services/storage.service';
import {EditAvatarComponent} from '../../admin/profile-card-dialog/edit-avatar/edit-avatar.component';
import {filter, switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit {

  @Input() user: User;
  @Input() schools: School[];

  @Output() nextPage: EventEmitter<any> = new EventEmitter<any>();

  isStaff: boolean;

  frameMotion$: BehaviorSubject<any>;
  userAuthType: string;

  isOpenAvatarDialog: boolean;
  loadingProfilePicture: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formService: CreateFormService,
    private storage: StorageService,
    public dialogRef: MatDialogRef<MyProfileDialogComponent>,
    private matDialog: MatDialog,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.isStaff = !User.fromJSON(this.user).isStudent();
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.userAuthType = this.storage.getItem('authType');
  }

  checkAccountType(account: User) {
    if (account.sync_types.indexOf('google') !== -1) {
      return 'Connected with G Suite';
    } else if (account.sync_types.indexOf('gg4l') !== -1) {
      return 'Connected with GG4L';
    } else if (account.sync_types.indexOf('clever') !== -1) {
      return 'Connected with Clever';
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
      } else if (currRole === '_profile_parent') {
        return [...acc, 'Parent'];
      }
      return [...acc];
    }, []).join(', ');
  }

  openEditAvatar(event) {
    this.isOpenAvatarDialog = true;
    const target = event.currentTarget ? event.currentTarget : event;
    const ED = this.matDialog.open(EditAvatarComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: { 'trigger': target, user: this.user }
    });

    ED.afterClosed()
      .pipe(
        tap(() => this.isOpenAvatarDialog = false),
        filter(r => !!r),
        tap(({action, file}) => {
          this.loadingProfilePicture.next(true);
          if (action === 'add') {
            this.userService.addProfilePictureRequest(this.user, '_profile_teacher',  file);
          } else if (action === 'edit') {
            this.userService.addProfilePictureRequest(this.user, '_profile_teacher', file);
          }
        }),
        switchMap(() => {
          return this.userService.currentUpdatedAccount$['_profile_teacher']
            .pipe(filter(res => !!res));
        }),
        tap((user => {
          this.user = User.fromJSON(user);
          this.userService.clearCurrentUpdatedAccounts();
          this.loadingProfilePicture.next(false);
        }))
      ).subscribe();
  }

}
