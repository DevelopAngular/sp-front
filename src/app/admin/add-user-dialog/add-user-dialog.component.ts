import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {User} from '../../models/User';
import {PdfGeneratorService} from '../pdf-generator.service';
import {zip} from 'rxjs';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  public accountTypes: string[] = ['G Suite', 'Alternative'];
  public typeChoosen: string = this.accountTypes[0];
  public newAlternativeAccount: FormGroup;
  public selectedUsers: User[];
  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public controlsIteratable: any[];
  public permissionsChanged: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private pdfService: PdfGeneratorService,
    private userService: UserService
  ) {

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
  addUser() {
    let role: any = this.data.role.split('_');
    role = role[role.length - 1];
    console.log('======>>>>>', role, this.selectedUsers);
    // return
    zip(...this.selectedUsers.map((user) => this.userService.addUserToProfile(user.id, role)))
      .subscribe((res) => {
          this.dialogRef.close(true);
      });
  }
  setSelectedUsers(evt) {
    this.selectedUsers = evt;
  }
  showInstructions(role) {
    this.pdfService.generateProfileInstruction(this.data.role);
  }
  back() {
    this.dialogRef.close();
  }
}
