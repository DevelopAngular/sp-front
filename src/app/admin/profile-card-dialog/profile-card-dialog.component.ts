import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {User} from '../../models/User';
import {Location} from '../../models/Location';
import {Router} from '@angular/router';
import {map, mapTo, switchMap, tap} from 'rxjs/operators';
import {DataService} from '../../services/data-service';
import {FormControl, FormGroup} from '@angular/forms';
import {fromEvent, Observable, of, Subject, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {HttpService} from '../../services/http-service';

import * as _ from 'lodash';
import {GSuiteSelector} from '../../sp-search/sp-search.component';

@Component({
  selector: 'app-profile-card-dialog',
  templateUrl: './profile-card-dialog.component.html',
  styleUrls: ['./profile-card-dialog.component.scss']
})
export class ProfileCardDialogComponent implements OnInit {
  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('rc') set rc(rc: ElementRef<HTMLDivElement> ) {
    if (rc) {
      fromEvent( rc.nativeElement, 'scroll').subscribe((evt: Event) => {
        let blur: number;

        if ((evt.target as HTMLDivElement).scrollTop < 100) {
          blur = 5;
        } else if ((evt.target as HTMLDivElement).scrollTop > 100 && (evt.target as HTMLDivElement).scrollTop < 400) {
          blur = (evt.target as HTMLDivElement).scrollTop / 20;
        } else {
          blur = 20;
        }

        this.header.nativeElement.style.boxShadow = `0 1px ${blur}px 0px rgba(0,0,0,.2)`;
      });
    }
  }
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

  public orgUnitSelector: GSuiteSelector[];
  public orgUnitSelectorInitialState: GSuiteSelector;
  public orgUnitSelectorEditState: boolean;
  public checkSelectorForUpdating$:  Subject<GSuiteSelector[]> = new Subject();
  public signInStatus: {
    touched: boolean,
    value: boolean,
    initialValue: boolean
  };

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

    if (this.data.orgUnit) {
      this.layout = 'gSuiteSettings';
      this.headerIcon = `./assets/${this.data.orgUnit.title} (Navy).svg`;

      this.orgUnitSelector = _.cloneDeep(this.data.orgUnit.selector);

      this.checkSelectorForUpdating$.subscribe((updatedSelector: GSuiteSelector[]) => {
        this.orgUnitSelector = updatedSelector;
        this.orgUnitSelectorEditState = !_.isEqual(this.orgUnitSelectorInitialState, updatedSelector);
      });
    }
    if (this.data.bulkPermissions) {
      this.layout = 'bulkPermissions';
    }

    if (this.data.profile) {

      this.profile = this.data.profile;
      this.signInStatus = {
        touched: false,
        value: false,
        initialValue: this.profile._originalUserProfile.active
      };

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
                          this.data.role === '_profile_admin' && this.data.orgUnit === 'admin'
                          ?
                          'Admin'
                          :
                          this.data.role === '_profile_teacher' && this.data.orgUnit === 'teacher'
                          ?
                          'Teacher'
                          :
                          this.data.role === '_profile_assistant' && this.data.orgUnit === 'assistant'
                          ?
                          'Assistant'
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
                      this.data.orgUnit
                      ?
                      `${this.data.orgUnit.title}s Group Syncing`
                      : '';

    if (this.data.role === '_profile_teacher') {console.log(this.profile);
       this.teacherAssignedTo = this.profile._originalUserProfile.assignedTo;
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
    window.open(`admin/search?profileId=${this.profile.id}&profileName=${this.profile['Name']}&role=${this.data.role}`, '_blank');
    // this.router.navigate(['admin/search'], {
    //   queryParams: {
    //     profileId: this.profile.id,
    //     profileName: this.profile['Name'],
    //     role: this.data.role
    //   }
    // });
  }
  goToPassConfig(location?: Location) {
    if (location) {
      window.open(`admin/passconfig?locationId=${location.id}`);
    } else {
      window.open('admin/passconfig');
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
      return zip(
        ...this.data.bulkPermissions.map((userId) => this.userService.createUserRoles(userId, this.permissionsForm.value))
      );
    } else if (this.permissionsFormEditState && this.assistantForEditState) {
      return zip(
        this.userService.createUserRoles(this.profile.id, this.permissionsForm.value),
        ...assistantForRemove.map((user) => this.userService.deleteRepresentedUser(this.profile.id, user)),
        ...assistantForAdd.map((user) => this.userService.addRepresentedUser(this.profile.id, user))
      );
    } else {
      if (this.permissionsFormEditState) {
        return this.userService
          .createUserRoles(this.profile.id, this.permissionsForm.value);
      }
      if (this.assistantForEditState) {

        return zip(
          ...assistantForRemove.map((user) => this.userService.deleteRepresentedUser(this.profile.id, user)),
          ...assistantForAdd.map((user) => this.userService.addRepresentedUser(this.profile.id, user))
        );
      }
    }
  }

  promptConfirmation(eventTarget: HTMLElement, option: string = '') {
    if (!eventTarget.classList.contains('button')) {
      (eventTarget as any) = eventTarget.closest('.button');
    }

    eventTarget.style.opacity = '0.75';

      of(option)
        .pipe(
          switchMap((action): Observable<any> => {
            eventTarget.style.opacity = '1';

            switch (action) {
              case 'delete_from_profile':
                return this.userService.deleteUserRequest(this.profile.id, this.data.role).pipe(mapTo('close'));
              case 'disable_sign_in':
                this.signInStatus.touched = true;
                this.signInStatus.value = false;
                return of(false);
              case 'enable_sign_in':
                this.signInStatus.touched = true;
                this.signInStatus.value = true;
                return of(true);
              default:
                return of( 'close');
            }
          }),
        )
        .subscribe((res) => {
          this.profile._originalUserProfile.active = res;
          if (res === 'close') {
            this.dialogRef.close(res);
          }
        });

  }

  back() {
    if (this.permissionsFormEditState || this.assistantForEditState) {
      this.updateProfile().subscribe(() => {
        this.dialogRef.close(true);
      });
    } else if (this.signInStatus.touched && this.signInStatus.value !== this.signInStatus.initialValue) {
      this.userService.setUserActivityRequest(this.profile._originalUserProfile, this.signInStatus.value, this.data.role)
        .subscribe(() => {
          this.dialogRef.close(false);
        });
    } else {
      this.dialogRef.close(false);
    }
  }
}
