import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../models/User';
import {PdfGeneratorService} from '../pdf-generator.service';
import {BehaviorSubject, fromEvent, of, throwError, zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {School} from '../../models/School';
import {catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap} from 'rxjs/operators';
import { filter as _filter } from 'lodash';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {
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
  public accountTypes: string[] = ['G Suite', 'Standard'];
  public typeChoosen: string = this.accountTypes[0];
  public newAlternativeAccount: FormGroup;
  public selectedUsers: User[] = [];
  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public controlsIteratable: any[];
  public assistantLike: {
    user: User,
    behalfOf: User[]
  };
  public school: School;
  public state: string;
  public accounts = [
      { title: 'Admin', icon: 'Admin', selected: false, role: '_profile_admin', disabled: false},
      { title: 'Teacher', icon: 'Teacher', selected: false, role: '_profile_teacher', disabled: false },
      { title: 'Assistant', icon: 'Assistant', selected: false, role: '_profile_assistant', disabled: false },
      { title: 'Student', icon: 'Student', selected: false, role: '_profile_student', disabled: false }
  ];
  private pendingSubject = new BehaviorSubject(false);
  public pending$ = this.pendingSubject.asObservable();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private pdfService: PdfGeneratorService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private http: HttpService,
    private router: Router

  ) {
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

  get showNextButton() {
    if (this.typeChoosen === this.accountTypes[0] && !this.state) {
        return (this.data.role === '_profile_assistant' && ((this.assistantLike.user || this.newAlternativeAccount.valid))) ||
            (this.data.role === '_all' && (this.newAlternativeAccount.valid || this.selectedUsers.length));
    } else if (this.data.role === '_profile_assistant' && this.typeChoosen === this.accountTypes[1] && !this.state) {
      return this.newAlternativeAccount.valid;
    } else if (this.data.role === '_all' && !this.state) {
      return this.newAlternativeAccount.valid;
    } else {
      return false;
    }
  }

  ngOnInit() {
    this.newAlternativeAccount = new FormGroup({
      name: new FormControl('', [
          Validators.required,
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ], [this.uniqueEmailValidator.bind(this)]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
    });

    if (this.data.role !== '_profile_student' && this.data.role !== '_all') {
      const permissions = this.data.permissions;
      this.controlsIteratable = Object.values(permissions);
      const group: any = {};
      for (const key in permissions) {
        group[key] = new FormControl(true);
      }
      this.permissionsForm = new FormGroup(group);
      this.permissionsForm.valueChanges.subscribe((formValue) => {
        console.log(formValue);
        this.permissionsFormEditState = true;

      });
    }
    this.http.errorToast$.asObservable()
      .pipe(
        filter(v => !!v)
      )
      .subscribe(() => {
        this.pendingSubject.next(false);
      });
  }

  uniqueEmailValidator(control: FormControl) {
    return control.valueChanges
      .pipe(
        take(1),
        distinctUntilChanged(),
        debounceTime(300),
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
    if (this.typeChoosen === this.accountTypes[0]) {
      if (this.data.role === '_profile_assistant' && this.state) {
          return this.assistantLike.user && this.assistantLike.behalfOf.length;
      } else if (this.data.role === '_all' && this.state) {
        if (this.selectedRoles.length && this.selectedRoles.find(acc => acc.role === '_profile_assistant')) {
          return this.assistantLike.behalfOf.length;
        } else {
            return this.selectedUsers && this.selectedUsers.length && this.selectedRoles.length;
        }
      } else {
          return this.selectedUsers && this.selectedUsers.length;
      }
    } else if (this.typeChoosen === this.accountTypes[1]) {
      if (this.data.role !== '_profile_assistant' && this.data.role !== '_all') {
          return this.newAlternativeAccount.valid;
      } else {
        if (this.data.role !== '_all') {
            return this.newAlternativeAccount.valid && this.assistantLike.behalfOf.length;
        } else {
          if (this.selectedRoles.length && this.selectedRoles.find(acc => acc.role === '_profile_assistant')) {
            return this.assistantLike.behalfOf.length;
          } else {
              return this.selectedRoles.length;
          }
        }
      }
    }
  }

  isDisabled(role) {
    if ((role === '_profile_assistant' || role === '_profile_student') &&
        this.selectedRoles.find(account => account.role === '_profile_admin' || account.role === '_profile_teacher')) {
      return true;
    } else if ((role === '_profile_admin' || role === '_profile_teacher' || role === '_profile_student') &&
        this.selectedRoles.find(account => account.role === '_profile_assistant')) {
      return true;
    } else if ((role === '_profile_admin' || role === '_profile_teacher' || role === '_profile_assistant') &&
        this.selectedRoles.find(account => account.role === '_profile_student')) {
      return true;
    } else {
      return false;
    }
  }

  showIncomplete() {
    if (this.typeChoosen === this.accountTypes[1]) {
      return this.newAlternativeAccount.dirty && !this.showSaveButton() && !this.showNextButton;
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
    } else if (this.data.role === '_all') {
      this.state = 'selectRole';
    }
  }

  addUser() {
    const role: any = this.data.role.split('_').reverse()[0];

    of(null)
      .pipe(
        tap(() => this.pendingSubject.next(true)),
        map(() => {
          const selectedRoles = this.selectedRoles.map(acc => {
            const oneRole = acc.role.split('_');
            return oneRole[oneRole.length - 1];
          });
          return role === 'all' ? selectedRoles : [role];
        }),
        switchMap((rolesToDb) => {
          if (this.typeChoosen === this.accountTypes[0]) {
            return zip(
              ...this.selectedUsers
                .map((user) => this.userService.addAccountToSchool(this.school.id, user, 'gsuite', rolesToDb))
            );
          } else if (this.typeChoosen === this.accountTypes[1]) {

            const regexpUsername = new RegExp('^[a-zA-Z0-9_-]{6}[a-zA-Z0-9_-]*$', 'i');
            const regexpEmail = new RegExp('^([A-Za-z0-9_\\-.])+@([A-Za-z0-9_\\-.])+\\.([A-Za-z]{2,4})$');

            if (regexpUsername.test(this.newAlternativeAccount.get('username').value)) {
              if (role !== 'assistant') {
                return this.userService
                            .addAccountToSchool(this.school.id, this.newAlternativeAccount.value, 'username', rolesToDb);
              } else {
                return this.userService
                  .addAccountToSchool(this.school.id, this.newAlternativeAccount.value, 'username', rolesToDb)
                  .pipe(
                    switchMap(
                      (assistant: User) => {
                        return zip(
                          ...this.assistantLike.behalfOf.map((teacher: User) => {
                            return this.userService
                              .addRepresentedUser(+assistant.id, teacher)
                              .pipe(tap(console.log));
                          })
                        );
                      }
                    ),
                  );
              }
            } else if (regexpEmail.test(this.newAlternativeAccount.get('username').value)) {
              const data = this.buildUserDataToDB(this.newAlternativeAccount.value);
              if (role !== 'assistant') {
               return this.userService.addAccountToSchool(this.school.id, data, 'email', rolesToDb);
              } else {
                return this.userService.addAccountToSchool(this.school.id, data, 'email', rolesToDb)
                  .pipe(
                    switchMap(
                      (assistant: User) => {
                        // console.log(assistant);
                        return zip(
                          ...this.assistantLike.behalfOf.map((teacher: User) => {
                            return this.userService.addRepresentedUser(+assistant.id, teacher).pipe(tap(console.log));
                          })
                        );
                      }
                    ),
                  );
              }
            } else {
              throw new Error('Format Error');
            }
          }
        }),
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            this.http.errorToast$.next({
              header: 'Format Error',
              message: err.error.errors[0]
            });
          } else if (err.message === 'Format Error') {
            this.http.errorToast$.next({
              header: 'Format Error',
              message: 'User name should be at least 6 symbols length.'
            });
          }
          return throwError(err);
        })
      )
      .subscribe((res) => {
        this.pendingSubject.next(false);
        this.dialogRef.close(true);
        if (this.selectedRoles.length) {
          this.router.navigate(['admin', 'accounts', this.selectedRoles[0].role]);
        }
      });
  }

  buildUserDataToDB(control) {
    return {
      email: control.username,
      password: control.password,
      first_name: control.name.split(' ')[0],
      last_name: control.name.split(' ')[1],
      display_name: control.name
    }
  }

  setSelectedUsers(evt) {
    if (this.data.role === '_profile_assistant') {
        this.assistantLike.user = evt[0];
    } else {
        this.selectedUsers = evt;
    }
    console.log(evt);
  }
  setSecretary(evtUser, evtBehalfOf) {
    if (evtUser) {
      this.assistantLike.user = evtUser[0];
    }
    if (evtBehalfOf) {
      this.assistantLike.behalfOf = evtBehalfOf;
    }
    // console.log(this.assistantLike);
  }

  showInstructions(role) {
    this.pdfService.generateProfileInstruction(this.data.role);
  }
  back() {
    this.dialogRef.close();
  }
}

// myFiel.valueChanges.pipe(map(value) => {myField: value})
//
// {keyFiled: valu}
