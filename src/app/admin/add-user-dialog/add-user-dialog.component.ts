import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {User} from '../../models/User';
import {PdfGeneratorService} from '../pdf-generator.service';
import {zip} from 'rxjs';
import {UserService} from '../../services/user.service';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpService} from '../../services/http-service';
import {School} from '../../models/School';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  public accountTypes: string[] = ['gsuite', 'alternative'];
  public typeChoosen: string = this.accountTypes[0];
  public newAlternativeAccount: FormGroup;
  public selectedUsers: User[] = [];
  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public controlsIteratable: any[];
  public permissionsChanged: boolean = false;

  public secretaryOrSubstitute: {
    user: User,
    behalfOf: User
  }
  public school: School

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private pdfService: PdfGeneratorService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private http: HttpService

  ) {
    if (this.data.role === '_profile_assistant') {
      this.secretaryOrSubstitute = {
        user: null,
        behalfOf: null
      };
    }
    this.school = this.http.currentSchoolSubject.value;
  }

  ngOnInit() {
    this.newAlternativeAccount = new FormGroup({
      name: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl(''),
    });

    if (this.data.role !== '_profile_student') {
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
      if (this.data.role !== 'staff_secretary') {
        return this.selectedUsers && this.selectedUsers.length;
      } else {
        return this.secretaryOrSubstitute.user && this.secretaryOrSubstitute.behalfOf;
      }
    } else {
      return false;
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

  addUser() {
    let role: any = this.data.role.split('_');
    role = role[role.length - 1];
    console.log('======>>>>>', role, this.selectedUsers);
    // return
    zip(...this.selectedUsers.map((user) => this.userService.addAccountToSchool(this.school.id, user, this.typeChoosen, [role])))
      .subscribe((res) => {
          this.dialogRef.close(true);
      });
  }
  setSelectedUsers(evt) {
    console.log(evt);
    this.selectedUsers = evt;
  }
  setSecretary(evtUser, evtBehalfOf) {
    if (evtUser) {
      this.secretaryOrSubstitute.user = evtUser[0];
    }
    if (evtBehalfOf) {
      this.secretaryOrSubstitute.behalfOf = evtBehalfOf[0];
    }
    console.log(this.secretaryOrSubstitute);
  }

  showInstructions(role) {
    this.pdfService.generateProfileInstruction(this.data.role);
  }
  back() {
    this.dialogRef.close();
  }
}
