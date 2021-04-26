import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../models/User';
import {PdfGeneratorService} from '../pdf-generator.service';
import {BehaviorSubject, fromEvent, of, Subject, throwError, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {School} from '../../models/School';
import {catchError, debounceTime, distinctUntilChanged, map, pluck, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {filter as _filter} from 'lodash';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {SchoolSyncInfo} from '../../models/SchoolSyncInfo';
import {AdminService} from '../../services/admin.service';
import {KeyboardShortcutsService} from '../../services/keyboard-shortcuts.service';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit, OnDestroy {
  @ViewChild('header', { static: true }) header: ElementRef<HTMLDivElement>;
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
  public typeChosen: string;
  public newAlternativeAccount: FormGroup;
  public selectedUsers: User[] = [];
  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public assistantLike: {
    user: User,
    behalfOf: User[]
  } = {
    user: null,
    behalfOf: []
  };
  public school: School;
  public syncInfo: SchoolSyncInfo;
  public accountTypes: string[];
  public state: string;
  public accounts = [
      { title: 'Admin', icon: 'Admin', selected: true, role: '_profile_admin', disabled: false},
      { title: 'Teacher', icon: 'Teacher', selected: true, role: '_profile_teacher', disabled: false },
      { title: 'Assistant', icon: 'Assistant', selected: false, role: '_profile_assistant', disabled: false },
      { title: 'Student', icon: 'Student', selected: false, role: '_profile_student', disabled: false }
  ];
  public title: string;
  public icon: string;
  public userRoles: any[] = [];
  public roleErrors: boolean;
  public selectedUserErrors: boolean;
  private pendingSubject = new BehaviorSubject(false);
  public pending$ = this.pendingSubject.asObservable();
  public inputFocusNumber: number = 1;
  public forceFocus$ = new Subject();

  private destroy$ = new Subject();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private pdfService: PdfGeneratorService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private http: HttpService,
    private adminService: AdminService,
    private router: Router,
    private shortcuts: KeyboardShortcutsService,
    private toast: ToastService
  ) {
    this.syncInfo = this.data['syncInfo'];
    this.title = this.data['title'];
    this.icon = this.data['icon'];
    this.accountTypes = ['G Suite', 'Standard', 'GG4L'];
    this.typeChosen = this.data['type'];
    if (this.data.role === '_profile_assistant' || this.data.role === '_all') {
      this.assistantLike = {
        user: null,
        behalfOf: []
      };
    }
    this.school = this.http.currentSchoolSubject.value;
  }

  get selectedRoles() {
    return _filter(this.accounts, ['selected', true]);
  }

  get isAssistant() {
    return this.userRoles.find(acc => acc.role === 'Assistant');
  }

  get showNextButton() {
    if (this.typeChosen === this.accountTypes[0]) {
        return (this.isAssistant && ((this.assistantLike.user || this.newAlternativeAccount.valid)));
    } else if (this.isAssistant && this.typeChosen === this.accountTypes[1]) {
      return this.newAlternativeAccount.valid;
    } else {
      return false;
    }
  }

  get isAccessAdd() {
    if (
      this.userRoles.find(role => role.role === 'Admin') &&
      this.userRoles.find(role => role.role === 'Teacher') ||
      this.userRoles.find(role => role.role === 'Student'))
    {
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.newAlternativeAccount = new FormGroup({
      name: new FormControl('', [
          Validators.required,
      ]),
      addUsername: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ], [this.uniqueEmailValidator.bind(this)]),
      addPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
    });
    this.generateUserRoles();

    if (this.data.role !== '_profile_student' && this.data.role !== '_all') {
      const permissions = this.data.permissions;
      const group: any = {};
      for (const key in permissions) {
        group[key] = new FormControl(true);
      }
      this.permissionsForm = new FormGroup(group);
      this.permissionsForm.valueChanges.subscribe((formValue) => {
        this.permissionsFormEditState = true;

      });
    }

    this.shortcuts.onPressKeyEvent$
      .pipe(
        takeUntil(this.destroy$),
        pluck('key')
      )
      .subscribe(key => {
        if (key[0] === 'tab') {
          if (this.inputFocusNumber < 3) {
            this.inputFocusNumber += 1;
          } else if (this.inputFocusNumber === 3) {
            this.inputFocusNumber = 1;
          }
          this.forceFocus$.next();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  generateUserRoles() {
    if (this.data.role === '_profile_student') {
      this.userRoles.push({id: 1, role: 'Student', icon: './assets/Student (Navy).svg', description: 'Students can create passes, schedule passes for the future, and send pass requests to teachers.'});
    }
    if (this.data.role === '_profile_teacher') {
      this.userRoles.push({id: 2, role: 'Teacher', icon: './assets/Teacher (Navy).svg', description: 'Teachers can manage passes in his/her room, see hallway activity, create passes, and more.'});
    }
    if (this.data.role === '_profile_admin') {
      this.userRoles.push({id: 3, role: 'Admin', icon: './assets/Admin (Navy).svg', description: 'Admins can explore pass history, reports, manage rooms, set-up accounts, and more.'});
    }
    if (this.data.role === '_profile_assistant') {
      this.userRoles.push({id: 4, role: 'Assistant', icon: './assets/Assistant (Navy).svg', description: 'Assistants can act on behalf of other teachers: manage passes, create passes, and more.'});
    }

  }

  uniqueEmailValidator(control: FormControl) {
    return control.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        take(1),
        switchMap(value => {
          return this.userService.checkUserEmail(value)
            .pipe(
              take(1),
              map(({exists}: {exists: boolean}) => {
                return (exists ? { uniqEmail: true } : null);
              })
            );
        })
      );
  }

  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  showSaveButton() {
    if (this.typeChosen === this.accountTypes[0]) {
      if (this.data.role === '_profile_assistant' && this.state) {
          return this.assistantLike.user && this.assistantLike.behalfOf.length;
      } else if (this.data.role === '_all' && this.state) {
        if (this.userRoles.length && this.isAssistant) {
          return this.assistantLike.behalfOf.length;
        } else {
            return this.selectedUsers && this.selectedUsers.length && this.userRoles.length;
        }
      } else {
          return this.selectedUsers && this.selectedUsers.length;
      }
    } else if (this.typeChosen === this.accountTypes[1]) {
      if (this.data.role !== '_profile_assistant' && this.data.role !== '_all') {
          return this.newAlternativeAccount.valid;
      } else {
        if (this.data.role !== '_all') {
            return this.newAlternativeAccount.valid && this.assistantLike.behalfOf.length;
        } else {
          if (this.userRoles.length && this.isAssistant) {
            return this.assistantLike.behalfOf.length;
          } else {
              return this.userRoles.length;
          }
        }
      }
    }
  }


  showIncomplete() {
    if (this.typeChosen === this.accountTypes[1]) {
      return this.newAlternativeAccount.dirty && !this.showSaveButton();
    }
  }

  getBackground(item) {
    if (item.hovered) {
      if (item.pressed) {
        return '#E2E7F4';
      } else {
        return '#ECF1FF';
      }
    } else {
      return '#FFFFFF';
    }
  }

  next() {
    if (this.data.role === '_profile_assistant') {
      this.state = 'assistant';
    }
  }

  formSetErrors() {
    if (this.newAlternativeAccount.get('name').invalid) {
      this.newAlternativeAccount.get('name').markAsDirty();
      this.newAlternativeAccount.get('name').setErrors(this.newAlternativeAccount.get('name').errors);
    }
    if (this.newAlternativeAccount.get('addUsername').invalid) {
      this.newAlternativeAccount.get('addUsername').markAsDirty();
      this.newAlternativeAccount.get('addUsername').setErrors(this.newAlternativeAccount.get('addUsername').errors);
    }
    if (this.newAlternativeAccount.get('addPassword').invalid) {
      this.newAlternativeAccount.get('addPassword').markAsDirty();
      this.newAlternativeAccount.get('addPassword').setErrors(this.newAlternativeAccount.get('addPassword').errors);
    }
    if (!this.userRoles.length) {
      this.roleErrors = true;
    }
    if (!this.selectedUsers.length) {
      this.selectedUserErrors = true;
    }
  }

  addUser() {
    if (!this.newAlternativeAccount.invalid || this.userRoles.length) {
      const role: any = this.data.role.split('_').reverse()[0];

      of(null)
        .pipe(
          tap(() => this.pendingSubject.next(true)),
          map(() => {
            return this.userRoles.map(acc => {
              return acc.role.toLowerCase();
            });
          }),
          switchMap((rolesToDb) => {
            if (this.typeChosen === this.accountTypes[0]) {
              return zip(
                ...this.selectedUsers
                  .map((user) => this.userService.addAccountRequest(this.school.id, user, 'gsuite', rolesToDb, this.data.role))
              );
            } else if (this.typeChosen === this.accountTypes[1]) {

              const regexpUsername = new RegExp('^[a-zA-Z0-9_-]{6}[a-zA-Z0-9_-]*$', 'i');
              const regexpEmail = new RegExp('^([A-Za-z0-9_\\-.])+@([A-Za-z0-9_\\-.])+\\.([A-Za-z]{2,4})$');

              if (regexpUsername.test(this.newAlternativeAccount.get('addUsername').value)) {
                const data = this.buildUserDataToDB(this.newAlternativeAccount.value);
                if (this.assistantLike.behalfOf.length) {
                  return this.userService.addAccountRequest(this.school.id, data, 'username', rolesToDb, this.data.role, this.assistantLike.behalfOf);
                } else {
                  return this.userService
                    .addAccountRequest(this.school.id, data, 'username', rolesToDb, this.data.role);
                }
              } else if (regexpEmail.test(this.newAlternativeAccount.get('addUsername').value)) {
                const data = this.buildUserDataToDB(this.newAlternativeAccount.value);
                if (this.assistantLike.behalfOf.length) {
                  return this.userService.addAccountRequest(this.school.id, data, 'email', rolesToDb, this.data.role, this.assistantLike.behalfOf);
                } else {
                  return this.userService
                    .addAccountRequest(this.school.id, data, 'email', rolesToDb, this.data.role);
                }
              } else {
                throw new Error('Format Error');
              }
            }
          }),
          catchError((err) => {
            if (err instanceof HttpErrorResponse) {
              this.toast.openToast({title: 'Format Error', subtitle: err.error.errors[0], type: 'error'});
              // this.http.errorToast$.next({
              //   header: 'Format Error',
              //   message: err.error.errors[0]
              // });
            } else if (err.message === 'Format Error') {
              this.toast.openToast({title: 'Format Error', subtitle: 'User name should be at least 6 symbols length.', type: 'error'});
              // this.http.errorToast$.next({
              //   header: 'Format Error',
              //   message: 'User name should be at least 6 symbols length.'
              // });
            }
            return throwError(err);
          })
        )
        .subscribe((res) => {
          this.toast.openToast({
            title: 'Success',
            subtitle: 'New account added',
            type: 'success',
            showButton: true,
            buttonText: 'Open profile',
            action: 'open_profile'
          });
          this.pendingSubject.next(false);
          this.dialogRef.close(res);

        });
    } else {
      this.formSetErrors();
    }

  }

  buildUserDataToDB(control) {
    return {
      email: control.addUsername,
      password: control.addPassword,
      first_name: control.name.split(' ')[0],
      last_name: control.name.split(' ')[1] || '',
      display_name: control.name
    };
  }

  setSelectedUsers(evt) {
    if (this.data.role === '_profile_assistant') {
        this.assistantLike.user = evt[0];
    } else {
        this.selectedUsers = evt;
        if (this.selectedUsers.length) {
          this.selectedUserErrors = false;
        }
    }

  }
  setSecretary(evtUser, evtBehalfOf) {
    if (evtUser) {
      this.assistantLike.user = evtUser[0];
    }
    if (evtBehalfOf) {
      this.assistantLike.behalfOf = evtBehalfOf;
    }
  }

  selectRole(roles) {
    this.userRoles = roles;
    if (this.roleErrors && this.userRoles.length) {
      this.roleErrors = false;
    }
  }

  back() {
    this.dialogRef.close();
  }
}
