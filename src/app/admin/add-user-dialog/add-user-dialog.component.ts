import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../models/User';
import {PdfGeneratorService} from '../pdf-generator.service';
import {zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {School} from '../../models/School';
import {filter, switchMap, tap} from 'rxjs/operators';

import * as _ from 'lodash';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  public accountTypes: string[] = ['G Suite', 'Standard'];
  public typeChoosen: string = this.accountTypes[0];
  public newAlternativeAccount: FormGroup;
  public selectedUsers: User[] = [];
  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public controlsIteratable: any[];
  public permissionsChanged: boolean = false;

  public assistantLike: {
    user: User,
    behalfOf: User[]
  };
  public school: School;

  public state: string;

  public accounts = [
      { title: 'Admins', selected: false, role: '_profile_admin' },
      { title: 'Teachers', selected: false, role: '_profile_teacher' },
      { title: 'Assistants', selected: false, role: '_profile_assistant' },
      { title: 'Students', selected: false, role: '_profile_student' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private pdfService: PdfGeneratorService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private http: HttpService

  ) {
    if (this.data.role === '_profile_assistant') {
      this.assistantLike = {
        user: null,
        behalfOf: null
      };
    }
    this.school = this.http.currentSchoolSubject.value;
  }

  get selectedRoles() {
    return _.filter(this.accounts, ['selected', true]);
  }

  get showNextButton() {
    return (this.data.role === '_profile_assistant' && ((this.assistantLike.user || this.newAlternativeAccount.valid) && !this.assistantLike.behalfOf)) ||
        (this.data.role === '_all' && this.newAlternativeAccount.valid && !this.selectedRoles.length);
  }

  ngOnInit() {
    this.newAlternativeAccount = new FormGroup({
      name: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
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
      if (this.data.role !== '_profile_assistant') {
        return this.selectedUsers && this.selectedUsers.length;
      } else {
        return this.assistantLike.user;
      }
    } else if (this.typeChoosen === this.accountTypes[1]) {
      return this.newAlternativeAccount.valid;
    }
  }

  showIncomplete() {
    if (this.typeChoosen === this.accountTypes[1]) {
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
    } else if (this.data.role === '_all') {
      this.state = 'selectRole';
    }
  }

  addUser() {
    let role: any = this.data.role.split('_');
    role = role[role.length - 1];
    console.log('======>>>>>', role, this.selectedUsers, this.assistantLike);

    if (role === 'assistant') {
          this.userService
              .addAccountToSchool(this.school.id, this.assistantLike.user, this.typeChoosen, [role])
              .pipe(
                  switchMap(
                      (assistant: User) => {
                          console.log(assistant);
                          return zip(
                              ...this.assistantLike.behalfOf.map((teacher: User) => {

                                  return this.userService.addRepresentedUser(+assistant.id, teacher).pipe(tap(console.log));
                              })
                          );
                      }
                  ),
              )
              .subscribe((res) => {
                  this.dialogRef.close(true);
              });
    } else {
      zip(
        ...this.selectedUsers.map((user) => this.userService.addAccountToSchool(this.school.id, user, this.typeChoosen, [role]))
      )
      .subscribe((res) => {
        this.dialogRef.close(true);
      });
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
    console.log(this.assistantLike);
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