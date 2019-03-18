import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {User} from '../../models/User';
import {PdfGeneratorService} from '../pdf-generator.service';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {

  public accountTypes: string[] = ['G Suite', 'Alternative'];
  public typeChoosen: string = this.accountTypes[0];
  public newAlternativeAccount: FormGroup;

  public permissionsForm: FormGroup;
  public permissionsFormEditState: boolean = false;
  public controlsIteratable: any[];
  public permissionsChanged: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private pdfService: PdfGeneratorService
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
  setSelectedUsers(evt) {
    return;
  }
  showInstructions(role) {
    this.pdfService.generateProfileInstruction(this.data.role);
  }
  back() {
    this.dialogRef.close();
  }
}
