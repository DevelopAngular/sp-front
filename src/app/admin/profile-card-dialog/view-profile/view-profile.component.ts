import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, of, Subject, zip } from 'rxjs';
import { Location } from '../../../models/Location';
import { User } from '../../../models/User';
import { FormControl, FormGroup } from '@angular/forms';
import { GSuiteSelector } from '../../../sp-search/sp-search.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data-service';
import { UserService } from '../../../services/user.service';
import { LocationsService } from '../../../services/locations.service';
import { CreateFormService } from '../../../create-hallpass-forms/create-form.service';
import { cloneDeep, differenceBy, isEqual } from 'lodash';
import {filter, mapTo, switchMap} from 'rxjs/operators';
import { ProfileCardDialogComponent } from '../profile-card-dialog.component';
import {StatusPopupComponent} from '../status-popup/status-popup.component';
import {EditAvatarComponent} from '../edit-avatar/edit-avatar.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {

  @Input() data: any;
  @Output() nextStep: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

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
  @ViewChild('status') statusButton: ElementRef;

  public profile: any;
  public teacherAssignedTo: Location[] = [];
  profilePermissions: {
    [profile: string]: {label: string, permission: string, icon?: string}[]
  } = {teacher: [], admin: [], assistant: [], student: []};

  public assistantFor: User[];
  public assistantForEditState: boolean = false;
  public assistantForInitialState: User[];
  public assistantForUpdate$: Subject<User[]> = new Subject();

  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  private permissionsFormInitialState;

  public controlsIteratable: any[];
  public disabledState: boolean = false;
  public headerText: string = '';
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
  user: User;
  roles: { id: number, role: string, icon: string }[] = [
    {id: 1, role: 'Student', icon: './assets/Student (Blue-Gray).svg'},
    {id: 2, role: 'Teacher', icon: './assets/Teacher (Blue-Gray).svg'},
    {id: 3, role: 'Admin', icon: './assets/Admin (Blue-Gray).svg'},
    {id: 4, role: 'Assistant', icon: './assets/Assistant (Blue-Gray).svg'}
  ];
  initialRoles: { id: number, role: string, icon: string }[];
  userRoles: { role: string, icon: string }[] = [];
  initialSelectedRoles: { role: string, icon: string }[];
  profileStatusActive: string;
  profileStatusInitial: string;

  frameMotion$: BehaviorSubject<any>;

  assistantToAdd: User[];
  assistantToRemove: User[];

  constructor(
    public dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private matDialog: MatDialog,
    private router: Router,
    private dataService: DataService,
    private userService: UserService,
    private locationService: LocationsService,
    private formService: CreateFormService
  ) {}

  get isAccessAdd() {
    return !this.userRoles.find(role => role.role === 'Student');
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    if (this.data.orgUnit) {
      this.layout = 'gSuiteSettings';
      this.headerIcon = `./assets/${this.data.orgUnit.title} (Navy).svg`;

      this.orgUnitSelector = cloneDeep(this.data.orgUnit.selector);

      this.checkSelectorForUpdating$.subscribe((updatedSelector: GSuiteSelector[]) => {
        this.orgUnitSelector = updatedSelector;
        this.orgUnitSelectorEditState = !isEqual(this.orgUnitSelectorInitialState, updatedSelector);
      });
    }
    if (this.data.bulkPermissions) {
      this.layout = 'bulkPermissions';
    }

    if (this.data.profile) {
      this.profile = this.data.profile;
      this.user = User.fromJSON(this.profile._originalUserProfile);
      this.profileStatusActive = this.user.status;
      this.profileStatusInitial = cloneDeep(this.profileStatusActive);
      if (this.user.isStudent()) {
        this.userRoles.push(this.roles[0]);
      }
      if (this.user.isTeacher()) {
        this.userRoles.push(this.roles[1]);
      }
      if (this.user.isAdmin()) {
        this.userRoles.push(this.roles[2]);
      }
      if (this.user.isAssistant()) {
        this.userRoles.push(this.roles[3]);
      }
      this.initialRoles = cloneDeep(this.roles);
      this.initialSelectedRoles = cloneDeep(this.userRoles);
      this.roles = differenceBy(this.initialRoles, this.userRoles, 'id');

      this.signInStatus = {
        touched: false,
        value: false,
        initialValue: this.profile._originalUserProfile.active
      };

      if (this.data.role === '_profile_assistant') {
        if (this.data.allAccounts) {
          this.userService.getRepresentedUsers(this.profile._originalUserProfile.id)
            .subscribe((res: any[]) => {
              this.assistantFor = res.map(ru => ru.user);
              this.assistantForInitialState = cloneDeep(this.assistantFor);
            });
        } else {
          this.assistantFor = this.profile._originalUserProfile.canActingOnBehalfOf.map(ru => ru.user);
          this.assistantForInitialState = cloneDeep(this.assistantFor);
        }
        this.assistantForUpdate$.subscribe((users: User[]) => {
          this.assistantToAdd = differenceBy(users, this.assistantForInitialState, 'id');
          this.assistantToRemove = differenceBy(this.assistantForInitialState, users, 'id');

          if (!isEqual(this.assistantFor, this.assistantForInitialState)) {
            this.assistantForEditState = true;
          } else {
            this.assistantForEditState = false;
          }
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

    if (this.data.role === '_profile_teacher') {
      if (this.data.allAccounts) {
        this.locationService.getLocationsWithTeacher(this.profile._originalUserProfile)
          .subscribe(res => {
            this.teacherAssignedTo = res;
          });
      } else {
        this.teacherAssignedTo = this.profile._originalUserProfile.assignedTo || [];
      }
    }

    this.buildPermissions();

    this.permissionsFormInitialState = cloneDeep(this.permissionsForm.value);
    this.permissionsForm.valueChanges.subscribe((formValue) => {
      this.permissionsFormEditState = !isEqual(Object.values(this.permissionsFormInitialState), Object.values(formValue));
    });

    this.dialogRef.backdropClick().subscribe((evt) => {
      this.back();
    });
  }

  getUserRole(role: string) {
    if (role === 'Teacher') {
      return '_profile_teacher';
    } else if (role === 'Admin') {
      return '_profile_admin';
    } else if (role === 'Student') {
      return '_profile_student';
    } else if (role === 'Assistant') {
      return '_profile_assistant';
    }
  }

  goToSearch() {
    window.open(`admin/search?profileId=${this.profile.id}&profileName=${this.profile['Name']}&role=${this.data.role}`, '_blank');
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
    if (this.profileStatusInitial !== this.profileStatusActive) {
      this.userService.updateUserRequest(this.user, {status: this.profileStatusActive});
    }

    if (!isEqual(this.initialSelectedRoles, this.userRoles)) {
      zip(...this.userRoles.map(role => {
        return this.userService.addUserToProfileRequest(this.user, role.role.toLowerCase());
      })).subscribe();
    }

   if (this.permissionsFormEditState && this.assistantForEditState) {
      return zip(
        this.userService.createUserRolesRequest(this.profile, this.permissionsForm.value, this.data.role),
        ...this.assistantToRemove.map((user) => this.userService.deleteRepresentedUserRequest(this.profile.id, user)),
        ...this.assistantToAdd.map((user) => this.userService.addRepresentedUserRequest(this.profile.id, user))
      );
    } else {
      if (this.permissionsFormEditState) {
        return this.userService
          .createUserRolesRequest(this.profile._originalUserProfile, this.permissionsForm.value, this.data.role);
      }
      if (this.assistantForEditState) {
        return zip(
          ...this.assistantToRemove.map((user) => this.userService.deleteRepresentedUserRequest(this.profile, user)),
          ...this.assistantToAdd.map((user) => this.userService.addRepresentedUserRequest(this.profile, user))
        );
      }
    }
    return of(null);
  }

  buildPermissions() {
    if (this.user.isTeacher()) {
      this.profilePermissions.teacher.push(
        {label: 'Passes', permission: 'access_passes', icon: 'Passes'},
        {label: 'Hall Monitor', permission: 'access_hall_monitor', icon: 'Walking'},
        {label: 'My Room', permission: 'access_teacher_room', icon: 'Room'}
        );
    }
    if (this.user.isAdmin()) {
      this.profilePermissions.admin.push(
        {label: 'Dashboard', permission: 'access_admin_dashboard', icon: 'Dashboard'},
        {label: 'Hall Monitor', permission: 'admin_hall_monitor', icon: 'Walking'},
        {label: 'Explore', permission: 'access_admin_search', icon: 'Search Eye'},
        {label: 'Rooms', permission: 'access_pass_config', icon: 'Room'},
        {label: 'Accounts', permission: 'access_user_config', icon: 'Users'}
      );
    }
    if (this.user.isAssistant()) {
      this.profilePermissions.assistant.push(
        {label: 'Passes', permission: 'access_passes', icon: 'Passes'},
        {label: 'Hall Monitor', permission: 'access_hall_monitor', icon: 'Walking'},
        {label: 'My Room', permission: 'access_teacher_room', icon: 'Room'}
      );
    }
    if (this.user.isStudent()) {
      this.profilePermissions.student.push(
        {label: 'Make passes without approval', permission: 'pass_approval'}
      );
    }
    const controls = {};
    this.profilePermissions.teacher.concat([...this.profilePermissions.admin, ...this.profilePermissions.assistant, ...this.profilePermissions.student]).forEach(perm => {
      controls[perm.permission] = new FormControl(this.user.roles.includes(perm.permission));
    });
    this.permissionsForm = new FormGroup(controls);

  }

  updateRoles(roles) {
    this.userRoles = roles;
    this.roles = differenceBy(this.initialRoles, this.userRoles, 'id');
  }

  back() {
    if (
      this.permissionsFormEditState ||
      this.assistantForEditState ||
      this.profileStatusInitial !== this.profileStatusActive ||
      !isEqual(this.initialSelectedRoles, this.userRoles)
    ) {
      this.updateProfile().subscribe(() => {
        this.close.emit(true);
      });
    } else {
      this.close.emit(false);
    }
  }

  getIsPermissionOn(permission) {
    return this.permissionsForm.get(permission).value;
  }

  openStatusPopup() {
   const SPC = this.matDialog.open(StatusPopupComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {
        'trigger': this.statusButton.nativeElement,
        'profile': this.user,
        'profileStatus': this.profileStatusActive
      }
    });

   SPC.afterClosed().pipe(filter(res => !!res)).subscribe(res => {
     if (res === 'delete') {
       this.userService.deleteUserRequest(this.profile.id, this.data.role);
       this.close.emit(false);
     }
     this.profileStatusActive = res;
   });
  }

  openEditAvatar(event) {
    const ED = this.matDialog.open(EditAvatarComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: { 'trigger': event.currentTarget }
    });
  }

}
