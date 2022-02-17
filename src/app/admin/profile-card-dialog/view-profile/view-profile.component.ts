import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BehaviorSubject, fromEvent, Observable, of, Subject, zip} from 'rxjs';
import {Location} from '../../../models/Location';
import {User} from '../../../models/User';
import {FormControl, FormGroup} from '@angular/forms';
import {GSuiteSelector} from '../../../sp-search/sp-search.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {LocationsService} from '../../../services/locations.service';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {cloneDeep, differenceBy, isEqual} from 'lodash';
import {filter, mapTo, switchMap, take, tap} from 'rxjs/operators';
import {ProfileCardDialogComponent} from '../profile-card-dialog.component';
import {StatusPopupComponent} from '../status-popup/status-popup.component';
import {EditAvatarComponent} from '../edit-avatar/edit-avatar.component';
import {ToastService} from '../../../services/toast.service';
import {ExclusionGroup} from '../../../models/ExclusionGroup';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';
import {ConsentMenuComponent} from '../../../consent-menu/consent-menu.component';
import {DarkThemeSwitch} from '../../../dark-theme-switch';
import {ProfilePictureComponent} from '../../accounts/profile-picture/profile-picture.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {

  @Input() data: any;
  @Input() exclusionGroups: ExclusionGroup[];
  @Output() nextStep: EventEmitter<any> = new EventEmitter<any>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Output() encounterGroupsEmit: EventEmitter<any> = new EventEmitter<any>();

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
  @ViewChild('avatarContainer') avatarContainer: ElementRef;
  @ViewChild('editIcon') editIcon: ElementRef;

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
    {id: 1, role: 'Student', icon: './assets/Student (Navy).svg'},
    {id: 2, role: 'Teacher', icon: './assets/Teacher (Navy).svg'},
    {id: 3, role: 'Admin', icon: './assets/Admin (Navy).svg'},
    {id: 4, role: 'Assistant', icon: './assets/Assistant (Navy).svg'}
  ];
  initialRoles: { id: number, role: string, icon: string }[];
  userRoles: { role: string, icon: string }[] = [];
  initialSelectedRoles: { role: string, icon: string }[];
  profileStatusActive: string;
  statusDescriptions: {[status: string]: string} = {
    'suspended': 'Suspending an account will not delete any data association, but no-one will see or be able to interact with this account.',
    'disabled': 'Disabling an account prevents them from signing in. They’ll still show up in SmartPass search, can make passes, etc.'
  };
  profileStatusInitial: string;

  frameMotion$: BehaviorSubject<any>;

  assistantToAdd: User[];
  assistantToRemove: User[];

  teacherRooms: Location[];
  teacherRoomsInitialState: Location[];

  isOpenAvatarDialog: boolean;

  loadingProfilePicture: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<ProfileCardDialogComponent>,
    private matDialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private locationService: LocationsService,
    private formService: CreateFormService,
    private toast: ToastService,
    private darkTheme: DarkThemeSwitch,
  ) {}

  get isAccessAdd() {
    if (
      this.userRoles.find(role => role.role === 'Admin') &&
      this.userRoles.find(role => role.role === 'Teacher') ||
      this.userRoles.find(role => role.role === 'Student')) {
      return false;
    }
    return true;
  }

  get isEdit() {
    return this.permissionsFormEditState ||
      this.assistantForEditState ||
      !isEqual(this.teacherRoomsInitialState, this.teacherRooms) ||
      !isEqual(this.initialSelectedRoles, this.userRoles);
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
      if (this.user.isTeacher() && !(this.user.isAdmin() || this.user.isAssistant())) {
        this.teacherRooms = cloneDeep(this.profile._originalUserProfile.assignedTo);
        this.teacherRoomsInitialState = cloneDeep(this.teacherRooms);
      }
      if ((this.user.isAdmin() || this.user.isAssistant()) && this.user.isTeacher()) {
        this.locationService.getLocationsWithTeacherRequest(this.user)
          .subscribe(locs => {
            this.teacherRooms = cloneDeep(locs);
            this.teacherRoomsInitialState = cloneDeep(this.teacherRooms);
          });
      }
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

      if (this.user.isAssistant()) {
        if (this.data.allAccounts) {
          this.userService.getRepresentedUsers(this.profile._originalUserProfile.id)
            .subscribe((res: any[]) => {
              this.assistantFor = res.map(ru => ru.user);
              this.assistantForInitialState = cloneDeep(this.assistantFor);
            });
        } else {
          if (!this.profile._originalUserProfile.canActingOnBehalfOf) {
            this.userService.getRepresentedUsers(this.profile._originalUserProfile.id)
              .subscribe((res: any[]) => {
                this.assistantFor = res.map(ru => ru.user);
                this.assistantForInitialState = cloneDeep(this.assistantFor);
              });
          } else {
            this.assistantFor = this.profile._originalUserProfile.canActingOnBehalfOf.map(ru => ru.user);
            this.assistantForInitialState = cloneDeep(this.assistantFor);
          }
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

    if (!isEqual(this.teacherRoomsInitialState, this.teacherRooms)) {
      const locsToRemove = differenceBy(this.teacherRoomsInitialState, this.teacherRooms, 'id').map(l => {
        l.teachers = l.teachers.filter(t => +t.id !== +this.user.id);
        return l;
      });
      const locsToAdd = differenceBy(this.teacherRooms, this.teacherRoomsInitialState, 'id').map(l => {
        l.teachers = [...l.teachers, this.user];
        return l;
      });

      this.userService.updateTeacherLocations(this.user, [...locsToRemove, ...locsToAdd], this.teacherRooms);
    }

    if (!isEqual(this.initialSelectedRoles, this.userRoles)) {
      const rolesToRemove = [];
      this.initialSelectedRoles.forEach(role => {
        if (!this.userRoles.find(r => r.role === role.role)) {
          rolesToRemove.push(role);
        }
      });
      if (rolesToRemove.length) {
        zip(...rolesToRemove.map(role => {
          return this.userService.deleteUserRequest(this.user.id, `_profile_${role.role.toLowerCase()}`);
        })).subscribe();
      }
      zip(...this.userRoles.map(role => {
        return this.userService.addUserToProfileRequest(this.user, role.role.toLowerCase());
      })).subscribe();
    }

   if (this.permissionsFormEditState && this.assistantForEditState) {
      return zip(
        this.userService.createUserRolesRequest(this.profile, this.permissionsForm.value, this.data.role),
        ...this.assistantToRemove.map((user) => this.userService.deleteRepresentedUserRequest(this.profile.id, user)),
        ...this.assistantToAdd.map((user) => this.userService.addRepresentedUserRequest(this.profile.id, user))
      ).pipe(mapTo('permissions'));
    } else {
      if (this.permissionsFormEditState) {
        return this.userService
          .createUserRolesRequest(this.profile._originalUserProfile, this.permissionsForm.value, this.data.role).pipe(mapTo('permissions'));
      }
      if (this.assistantForEditState) {
        return zip(
          ...this.assistantToRemove.map((user) => this.userService.deleteRepresentedUserRequest(this.profile, user)),
          ...this.assistantToAdd.map((user) => this.userService.addRepresentedUserRequest(this.profile, user))
        ).pipe(mapTo(''));
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
        {label: 'Accounts', permission: 'access_user_config', icon: 'Users'},
        {label: 'Integrations', permission: 'admin_manage_integration', icon: 'Integrations'}
      );
    }
    if (this.user.isAssistant()) {
      this.profilePermissions.assistant.push(
        {label: 'Passes', permission: 'access_passes', icon: 'Passes'},
        {label: 'Hall Monitor', permission: 'access_hall_monitor', icon: 'Walking'},
        {label: 'My Room', permission: 'access_teacher_room', icon: 'Room'}
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
    this.close.emit(false);
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

   SPC.afterClosed().pipe(filter(res => !!res)).subscribe((status) => {
     if (status === 'delete') {
       if (this.user.userRoles().length > 1) {
         this.user.userRoles().forEach(role => {
           return this.userService.deleteUserRequest(this.profile.id, role);
         });
       } else {
         this.userService.deleteUserRequest(this.profile.id, this.data.role);
       }
       this.toast.openToast({title: 'Account deleted', type: 'error'});
       this.back();
     } else {
       if (this.profileStatusInitial !== status) {
         this.userService.updateUserRequest(this.user, {status});
         this.toast.openToast({title: 'Account status updated', type: 'success'});
       }
     }
     this.profileStatusInitial = status;
     this.profileStatusActive = status;
   });
  }

  editWindow(event) {
    this.isOpenAvatarDialog = true;
    if (!this.userService.getUserSchool().profile_pictures_completed) {
      this.consentDialogOpen(this.editIcon.nativeElement);
    } else {
      this.openEditAvatar(this.editIcon.nativeElement);
    }
  }

  openEditAvatar(event) {
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
            this.userService.addProfilePictureRequest(this.user, this.data.role,  file);
          } else if (action === 'edit') {
            this.userService.addProfilePictureRequest(this.user, this.data.role, file);
          }
        }),
        switchMap(() => {
          return this.userService.currentUpdatedAccount$[this.data.role]
            .pipe(filter(res => !!res));
        }),
        tap((user => {
          this.user = User.fromJSON(user);
          this.userService.clearCurrentUpdatedAccounts();
          this.loadingProfilePicture.next(false);
        }))
      ).subscribe();
  }

  save() {
    this.updateProfile().subscribe((action) => {
      this.toast.openToast({
        title: 'Account updated',
        type: 'success'
      });
      this.close.emit(true);
    });
  }

  deleteAvatar() {
    this.loadingProfilePicture.next(true);
    this.userService.deleteProfilePicture(this.user, this.data.role)
      .pipe(
        filter(res => !!res),
        take(1)
      )
      .subscribe(res => {
        this.user = User.fromJSON({...this.user, profile_picture: null});
        this.userService.clearCurrentUpdatedAccounts();
        this.loadingProfilePicture.next(false);
      });
  }

  openExclusionGroups(action, group?) {
    this.encounterGroupsEmit.emit({action, group});
  }

  genOption(display, color, action, icon?) {
    return { display, color, action, icon };
  }

  consentDialogOpen(evt) {
    const options = [];
    options.push(this.genOption('Add individual picture', this.darkTheme.getColor({dark: '#FFFFFF', white: '#7f879d'}), 'individual', this.darkTheme.getIcon({iconName: 'Plus', darkFill: 'White', lightFill: 'Blue-Gray'})));
    options.push(this.genOption('Bulk upload pictures', this.darkTheme.getColor({dark: '#FFFFFF', white: '#7f879d'}), 'bulk', this.darkTheme.getIcon({iconName: 'Add Avatar', darkFill: 'White', lightFill: 'Blue-Gray'})));

    UNANIMATED_CONTAINER.next(true);

    const cancelDialog = this.matDialog.open(ConsentMenuComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: {'options': options, 'trigger': new ElementRef(evt)}
    });

    cancelDialog.afterClosed().pipe(tap(() => {
      UNANIMATED_CONTAINER.next(false);
      this.isOpenAvatarDialog = false
    }), filter(r => !!r))
      .subscribe(action => {
        if (action === 'individual') {
          this.isOpenAvatarDialog = true;
          this.openEditAvatar(this.editIcon.nativeElement);
        } else if (action === 'bulk') {
          const PPD = this.matDialog.open(ProfilePictureComponent, {
            panelClass: 'accounts-profiles-dialog',
            backdropClass: 'custom-bd',
            width: '425px',
            height: '500px'
          });
          this.dialogRef.close();
        }
      });
  }

}
