import {Component, OnInit, Input, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-edit-restrictions-dialog',
  templateUrl: './edit-restrictions-dialog.component.html',
  styleUrls: ['./edit-restrictions-dialog.component.scss']
})
export class EditRestrictionsDialogComponent implements OnInit {

  public layout: string;
  public palette: string;
  public header: string;
  public buttonColor: string;
  public buttonText: string;
  public form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private DR: MatDialogRef<EditRestrictionsDialogComponent>
  ) {



  }

  ngOnInit() {

    switch (this.data.mode) {

      case 'restrictions' : {
        this.layout = 'restrictions';
        this.header = 'Add/Modify Restrictions';
        this.buttonText = 'Done';
        this.buttonColor =  '#1893E9, #05B5DE';
        this.palette = `radial-gradient(circle at 80% 67%, ${this.buttonColor})`;
        const restrictions = this.data.restrictions;
        const group: any = {};

        for (const key in restrictions) {
          console.log(key);
          group[key] = new FormControl(restrictions[key]);
        }
        this.form = new FormGroup(group);
        break;
      }
      case 'remove' :
        this.layout = 'remove';
        this.header = 'Remove Account from this Profile';
        this.buttonText = 'Confirm';
        this.buttonColor =  '#DA2370, #FB434A';
        this.palette = `radial-gradient(circle at 80% 67%, ${this.buttonColor})`;
        break
      case 'teacher' :
        this.header = 'Add/Modify Acting Teacher Profile';
        this.buttonText = 'Add/Modify';
        this.buttonColor = '#13BF9E, #00D99B';
        this.palette = `radial-gradient(circle at 80% 67%, ${this.buttonColor})`;
        break
      case 'rooms' :
        this.layout = 'rooms',
        this.header = 'Add/Modify Rooms';
        this.buttonText = 'Add/Modify';
        this.buttonColor = '#022F68, #2F66AB';
        this.palette = `radial-gradient(circle at 80% 67%, ${this.buttonColor})`;
        break
      case 'create':
        this.header = 'Create Account to Administrator Profile',
        this.buttonText = 'Add Accounts to Profile';
        this.buttonColor = '#03cf31, #00b476';
        this.palette = `radial-gradient(circle at 80% 67%, ${this.buttonColor})`;
    };
  }
  closeDialog() {
    this.DR.close(this.form.value);
  }
}
