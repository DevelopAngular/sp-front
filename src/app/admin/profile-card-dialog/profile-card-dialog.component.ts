import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {Router} from '@angular/router';
import {map, switchMap, tap} from 'rxjs/operators';
import {DataService} from '../../services/data-service';
import {FormControl, FormGroup} from '@angular/forms';
import {empty, forkJoin, Observable, of, Subject, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {ConsentMenuComponent} from '../../consent-menu/consent-menu.component';
import {HttpService} from '../../services/http-service';

import * as _ from 'lodash';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss']
})
export class ProfileCardDialogComponent implements OnInit {

  public profile: any;
  public teacherAssignedTo: Location[] = [];

  public assistantFor: User[];
  public assistantForEditState: boolean = false;
  public assistantForInitialState: User[];
  public assistantForUpdate$:  Subject<User[]> = new Subject();



  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  private permissionsFormInitialState;

  public controlsIteratable: any[];
  public profileTouched: boolean = false;
  public disabledState: boolean = false;
  public headerText: string = '';
  public consentMenuOpened: boolean = false;
  public headerIcon: string;
  public layout: string = 'viewProfile';


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private matDialog: MatDialog,
    private router: Router,
    private dataService: DataService,
    private userService: UserService,
    private http: HttpService
  ) {}

  ngOnInit() {

    console.log(this.data);

    if (this.data.gSuiteSettings) {
      this.layout = 'gSuiteSettings';
      this.headerIcon = './assets/google/google_logo.svg';
    }
    if (this.data.bulkPermissions) {
      this.layout = 'bulkPermissions';

    }
    if (this.data.profile) {

      this.profile = this.data.profile;

      if (this.data.role === '_profile_assistant') {
        this.assistantFor = this.profile._originalUserProfile.canActingOnBehalfOf.map(ru => ru.user);
        this.assistantForInitialState = _.cloneDeep(this.assistantFor);
        this.assistantForUpdate$.subscribe((users: User[]) => {
          this.assistantFor = users;
          if (!_.isEqual(this.assistantFor, this.assistantForInitialState)) {
            this.assistantForEditState = true;
          } else {
            this.assistantForEditState = false;
          }
          console.log(users, this.assistantForEditState);
        });
      }


      this.headerIcon = `./assets/${
                          this.data.role === '_profile_admin'
                          ?
                          'Admin'
                          :
                          this.data.role === '_profile_teacher'
                          ?
                          'Teacher'
                          :
                          this.data.role === '_profile_assistant'
                          ?
                          'Secretary'
                          :
                          'Student'} (Navy).svg`;
    }

    this.headerText = this.data.bulkPermissions
                      ?
                      this.data.bulkPermissions.length + ` user${this.data.bulkPermissions.length > 1 ? 's' : ''} selected`
                      :
                      this.profile
                      ?
                      this.profile['Name']
                      :
                      'G Suite Settings';

    if (this.data.role === '_profile_teacher') {
        this.dataService.getLocationsWithTeacher(this.profile._originalUserProfile)
          .subscribe((locations: Location[]) => {
            this.teacherAssignedTo = locations;
          });
    }

    if (this.data.role !== '_profile_student' && this.data.role !== '_all') {
      const permissions = this.data.permissions;
      this.controlsIteratable = permissions ? Object.values(permissions) : [];
      // console.log(permissions);
      const group: any = {};
      for (const key in permissions) {
        const value = (this.profile._originalUserProfile as User).roles.includes(key);
        group[key] = new FormControl(value);
      }
      this.permissionsForm = new FormGroup(group);
      this.permissionsFormInitialState = _.cloneDeep(this.permissionsForm.value);
      this.permissionsForm.valueChanges.subscribe((formValue) => {
        this.permissionsFormEditState = !_.isEqual(Object.values(this.permissionsFormInitialState), Object.values(formValue));

      });
    }

    this.dialogRef.backdropClick().subscribe((evt) => {
      console.log(evt);
      this.back();
    });
  }

  goToSearch() {
    this.dialogRef.close();
    this.router.navigate(['admin/search'], {
      queryParams: {
        profileId: this.profile.id,
        profileName: this.profile['Name'],
        role: this.data.role
      }
    });
  }
  goToPassConfig(location: Location) {
    if (location) {
      window.open(`admin/passconfig?locationId=${location.id}`);
    } else {
      this.router.navigate(['admin/passconfig']);
    }

  }

  updateProfile(): Observable<any> {

    this.disabledState = true;

    const assistantForRemove = [];
    const assistantForAdd = [];

    if (this.assistantForEditState) {
      this.assistantForInitialState.forEach((iuser: User) => {
        if (this.assistantFor.findIndex((user) => user.id === iuser.id) < 0) {
          assistantForRemove.push(iuser);
        }
      });
      this.assistantFor.forEach((user: User) => {
        if (this.assistantForInitialState.findIndex((iuser) => iuser.id === user.id)) {
          assistantForAdd.push(user);
        }
      });
    }


    if ( this.data.bulkPermissions) {
      return zip(...this.data.bulkPermissions.map((userId) => this.userService.createUserRoles(userId, this.permissionsForm.value)))
        // .subscribe((result) => {
        //   console.log(result);
        //   this.disabledState = false;
        //   this.permissionsFormInitialState = _.cloneDeep(this.permissionsForm.value);
        //   this.profileTouched = true;
        //   this.permissionsFormEditState = false;
        // });

    } else if (this.permissionsFormEditState && this.assistantForEditState) {
      return zip(
        this.userService.createUserRoles(this.profile.id, this.permissionsForm.value),
        ...assistantForRemove.map((user) => this.userService.deleteRepresentedUser(this.profile.id, user)),
        ...assistantForAdd.map((user) => this.userService.addRepresentedUser(this.profile.id, user))
      )
      //   .subscribe((result) => {
      //   console.log(result);
      //   this.permissionsFormInitialState = _.cloneDeep(this.permissionsForm.value);
      //   this.permissionsFormEditState = false;
      //   this.assistantForInitialState = _.cloneDeep(this.assistantFor);
      //   this.assistantForEditState = false;
      //   this.disabledState = false;
      //   this.profileTouched = true;
      // });
    } else {
      if (this.permissionsFormEditState) {
        return this.userService
          .createUserRoles(this.profile.id, this.permissionsForm.value)
          // .subscribe((result) => {
          //   console.log(result);
          //   this.permissionsFormInitialState = _.cloneDeep(this.permissionsForm.value);
          //   this.disabledState = false;
          //   this.profileTouched = true;
          //   this.permissionsFormEditState = false;
          // });
      }
      if (this.assistantForEditState) {

        return zip(
          ...assistantForRemove.map((user) => this.userService.deleteRepresentedUser(this.profile.id, user)),
          ...assistantForAdd.map((user) => this.userService.addRepresentedUser(this.profile.id, user))
        )
        // .subscribe((result) => {
        //   console.log(result);
        //   this.assistantForInitialState = _.cloneDeep(this.assistantFor);
        //   this.disabledState = false;
        //   this.profileTouched = true;
        //   this.assistantForEditState = false;
        // });
      }
    }
  }

  promptConfirmation(eventTarget: HTMLElement, option: string = '') {

    if (!eventTarget.classList.contains('button')) {
      (eventTarget as any) = eventTarget.closest('.button');
    }

    eventTarget.style.opacity = '0.75';
    // let header: string;
    // let options: any[];
    // const profile: string =
    //   this.data.role === '_profile_admin' ? 'administrator' :
    //     this.data.role === '_profile_teacher' ? 'teacher' :
    //       this.data.role === '_profile_student' ? 'student' :
    //       this.data.role === '_profile_assistant' ? 'student' : 'assistant';

    // switch (option) {
    //   case 'delete_from_profile':
    //     if (this.data.role === '_all') {
    //       header = `Are you sure you want to permanently delete this account and all associated data? This cannot be undone.`;
    //     } else {
    //       header = `Removing this user from the ${profile} profile will remove them from this profile, but it will not delete all data associated with the account.`;
    //     }
    //     options = [{display: 'Confirm Remove', color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete_from_profile'}];
    //     break;
    //   case 'disable_sign_in':
    //
    //     header = `Disable sign-in to prevent this user from being able to sign in with the ${profile} profile.`;
    //     options = [{display: 'Disable sign-in', color: '#001115', buttonColor: '#001115, #033294', action: 'disable_sign_in'}];
    //     break;
    //   case 'enable_sign_in':
    //     header = `Enable sign-in to allow this user to be able to sign in with the ${profile} profile.`;
    //     options = [{display: 'Enable sign-in', color: '#03CF31', buttonColor: '#03CF31, #00B476', action: 'enable_sign_in'}];
    //     break;
    // }
    // const DR = this.matDialog.open(ConsentMenuComponent,
    //   {
    //     data: {
    //       role: this.data.role,
    //       selectedUsers: this.data.selectedUsers,
    //       restrictions: this.data.profilePermissions,
    //       header: header,
    //       options: options,
    //       trigger: new ElementRef(eventTarget)
    //     },
    //     panelClass: 'consent-dialog-container',
    //     backdropClass: 'invis-backdrop',
    //   });
      // DR.afterClosed()
      of(option)
        .pipe(
          switchMap((action): Observable<any> => {
            console.log(action);
            eventTarget.style.opacity = '1';

            switch (action) {
              case 'delete_from_profile':
                let role: any = this.data.role.split('_');
                role = role[role.length - 1];
                return this.userService.deleteUserFromProfile(this.profile.id, role).pipe(map(() => true));
                break;
              case 'disable_sign_in':
                return this.userService.setUserActivity(this.profile.id, false).pipe(map(() => true));
                break;
              case 'enable_sign_in':
                return this.userService.setUserActivity(this.profile.id, true).pipe(map(() => true));
                break;
              default:
                return of( null);
                break;
            }
            this.consentMenuOpened = false;
          }),
        )
        .subscribe((res) => {
          console.log(res);
          if (res != null) {
            this.http.setSchool(this.http.getSchool());
            this.dialogRef.close(res);
          }
        });

  }

  back() {
    if (this.permissionsFormEditState || this.assistantForEditState) {
      this.updateProfile().subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {

      this.dialogRef.close(false);
    }
  }
}
